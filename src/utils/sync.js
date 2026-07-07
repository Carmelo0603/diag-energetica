import { db } from '../db/database';
import { supabase } from '../lib/supabaseClient';

// Helper per unire array di oggetti in base a una chiave univoca (ID)
function mergeArrays(remoteArr = [], localArr = [], uniqueKey) {
    const map = new Map();
    // 1. Inseriamo prima i dati dal server
    (remoteArr || []).forEach(item => map.set(item[uniqueKey], item));
    // 2. I dati locali sovrascrivono i remoti a parità di ID (se li abbiamo modificati)
    // e aggiungono le nuove righe create offline
    (localArr || []).forEach(item => map.set(item[uniqueKey], item));
    return Array.from(map.values());
}

// Helper per unire array di primitive (es. codici POD) rimuovendo i duplicati
function mergePrimitiveArrays(arr1 = [], arr2 = []) {
    return [...new Set([...(arr1 || []), ...(arr2 || [])])];
}

export async function syncData() {
    // 1. Usciamo subito se siamo offline
    if (!navigator.onLine) return;

    // 2. Recuperiamo l'utente loggato
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const userId = session.user.id;

    try {
        console.log("🔄 Inizio Sincronizzazione Bi-direzionale...");

        // ==========================================
        // FASE 1: PULL INIZIALE (Scopriamo la verità sul cloud)
        // ==========================================
        const { data: edificiRemoti, error: errEdifici } = await supabase.from('edifici').select('*');
        const { data: ambientiRemoti, error: errAmbienti } = await supabase.from('ambienti').select('*');

        if (errEdifici || errAmbienti) throw new Error("Errore durante il Pull pre-merge da Supabase");

        // Creiamo delle mappe per cercare velocemente gli id
        const remotiEdificiMap = new Map((edificiRemoti || []).map(e => [e.id, e]));
        const remotiAmbientiMap = new Map((ambientiRemoti || []).map(a => [a.id, a]));

        // Prendiamo tutto quello che abbiamo in pancia (Dexie)
        const tuttiEdifici = await db.edifici.toArray();
        const tuttiAmbienti = await db.ambienti.toArray();

        const payloadEdifici = [];
        const payloadAmbienti = [];

        // ==========================================
        // FASE 2: MERGE E PREPARAZIONE PUSH
        // ==========================================

        // Processiamo gli Edifici Locali
        for (let loc of tuttiEdifici) {
            // Analizziamo solo quelli sporchi/non sincronizzati
            if (loc.is_synced === 0 || loc.is_synced === undefined) {
                const rem = remotiEdificiMap.get(loc.id);
                if (rem) {
                    // CONFLITTO TROVATO: Uniamo gli array in modo intelligente
                    loc.generatori_calore = mergeArrays(rem.generatori_calore, loc.generatori_calore, 'id_generatore');
                    loc.unita_immobiliari = mergeArrays(rem.unita_immobiliari, loc.unita_immobiliari, 'id_unita');
                    loc.pods = mergePrimitiveArrays(rem.pods, loc.pods);

                    const isLocalNewer = new Date(loc.last_modified).getTime() > new Date(rem.last_modified).getTime();
                    if (!isLocalNewer) {
                        // Se il server ha metadati testuali più recenti, teniamo quelli del server
                        loc.nome = rem.nome;
                        loc.note = rem.note;
                        loc.pdr = rem.pdr;
                        loc.macro_categoria = rem.macro_categoria;
                        loc.tipologia = rem.tipologia;
                    }
                }

                loc.user_id = userId;
                loc.last_modified = new Date().toISOString();
                payloadEdifici.push(loc);
            }
        }

        // Processiamo gli Ambienti Locali
        for (let loc of tuttiAmbienti) {
            // Analizziamo solo quelli sporchi/non sincronizzati
            if (loc.is_synced === 0 || loc.is_synced === undefined) {
                const rem = remotiAmbientiMap.get(loc.id);
                if (rem) {
                    // CONFLITTO TROVATO: Uniamo l'inventario senza sovrascriverlo!
                    loc.elementi_inseriti = mergeArrays(rem.elementi_inseriti, loc.elementi_inseriti, 'id_istanza');

                    const isLocalNewer = new Date(loc.last_modified).getTime() > new Date(rem.last_modified).getTime();
                    if (!isLocalNewer) {
                        // Se il server ha rinominato la stanza o cambiato i mq dopo di noi
                        loc.nome = rem.nome;
                        loc.mq = rem.mq;
                        loc.piano = rem.piano;
                        loc.lux_normativi = rem.lux_normativi;
                        loc.destinazione_uso_id = rem.destinazione_uso_id;
                    }
                }

                loc.user_id = userId;
                loc.last_modified = new Date().toISOString();
                payloadAmbienti.push(loc);
            }
        }

        // ==========================================
        // FASE 3: PUSH SU SUPABASE
        // ==========================================

        // Rimuoviamo il tag locale is_synced prima di spedire il pacchetto
        const cleanEdificiPush = payloadEdifici.map(({ is_synced, ...e }) => e);
        const cleanAmbientiPush = payloadAmbienti.map(({ is_synced, ...a }) => a);

        if (cleanEdificiPush.length > 0) {
            const { error } = await supabase.from('edifici').upsert(cleanEdificiPush);
            if (error) throw new Error(`Errore Upsert Edifici: ${error.message}`);
        }

        if (cleanAmbientiPush.length > 0) {
            const { error } = await supabase.from('ambienti').upsert(cleanAmbientiPush);
            if (error) throw new Error(`Errore Upsert Ambienti: ${error.message}`);
        }

        // ==========================================
        // FASE 4: FINAL PULL E ALLINEAMENTO LOCALE
        // ==========================================

        // Adesso che Supabase ha la "Verità Fusa Assoluta", la riscarichiamo
        // e allineiamo brutalmente IndexedDB affinché tutti i tablet siano identici
        const { data: finalEdifici, error: finalErrE } = await supabase.from('edifici').select('*');
        const { data: finalAmbienti, error: finalErrA } = await supabase.from('ambienti').select('*');

        if (finalErrE || finalErrA) throw new Error("Errore durante il Pull finale");

        await db.transaction('rw', db.edifici, db.ambienti, async () => {
            for (let rem of (finalEdifici || [])) {
                await db.edifici.put({ ...rem, is_synced: 1 });
            }
            for (let rem of (finalAmbienti || [])) {
                await db.ambienti.put({ ...rem, is_synced: 1 });
            }
        });

        console.log("🟢 Merge Bi-direzionale completato con successo!");

    } catch (error) {
        console.error("🔴 Sincronizzazione fallita:", error);
        throw error; // Rilanciamo l'errore per fermare la rotellina sull'interfaccia
    }
}