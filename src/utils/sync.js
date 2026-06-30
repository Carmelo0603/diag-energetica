import { db } from '../db/database';
import { supabase } from '../lib/supabaseClient';

export async function syncData() {
    // 1. Usciamo subito se siamo offline
    if (!navigator.onLine) return;

    // 2. Recuperiamo l'utente loggato
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const userId = session.user.id;

    try {
        // ==========================================
        // FASE 1: PUSH (Da Locale a Cloud)
        // ==========================================

        const edificiDaInviare = await db.edifici.where('is_synced').equals(0).toArray();
        const ambientiDaInviare = await db.ambienti.where('is_synced').equals(0).toArray();

        // Aggiungiamo il user_id richiesto dalle policy di Supabase
        const edificiPayload = edificiDaInviare.map(({ is_synced, ...e }) => ({ ...e, user_id: userId }));
        const ambientiPayload = ambientiDaInviare.map(({ is_synced, ...a }) => ({ ...a, user_id: userId }));

        // Mandiamo tutto su (Upsert fa insert se non esiste, update se l'id esiste già)
        if (edificiPayload.length > 0) {
            const { error } = await supabase.from('edifici').upsert(edificiPayload);
            if (error) throw new Error(`Errore Push Edifici: ${error.message}`);
        }

        if (ambientiPayload.length > 0) {
            const { error } = await supabase.from('ambienti').upsert(ambientiPayload);
            if (error) throw new Error(`Errore Push Ambienti: ${error.message}`);
        }

        // Se il push va a buon fine, ripuliamo Dexie segnando i record come sincronizzati.
        // Usiamo una transazione locale per sicurezza.
        await db.transaction('rw', db.edifici, db.ambienti, async () => {
            for (let e of edificiDaInviare) {
                // Aggiorniamo ignorando i nostri stessi hook per non ri-cambiare la data
                await db.edifici.update(e.id, { is_synced: 1 });
            }
            for (let a of ambientiDaInviare) {
                await db.ambienti.update(a.id, { is_synced: 1 });
            }
        });

        // ==========================================
        // FASE 2: PULL (Da Cloud a Locale)
        // ==========================================

        // Tiriamo giù i dati (Supabase filtrerà in automatico solo quelli dello studio grazie alle RLS)
        const { data: edificiRemoti, error: errEdifici } = await supabase.from('edifici').select('*');
        const { data: ambientiRemoti, error: errAmbienti } = await supabase.from('ambienti').select('*');

        if (errEdifici || errAmbienti) throw new Error("Errore durante il Pull da Supabase");

        await db.transaction('rw', db.edifici, db.ambienti, async () => {
            // Sincronizza Edifici
            for (let rem of edificiRemoti) {
                const loc = await db.edifici.get(rem.id);
                // Se in locale non esiste, o se il record in cloud è più recente, lo sovrascriviamo in locale
                if (!loc || new Date(rem.last_modified) > new Date(loc.last_modified)) {
                    await db.edifici.put({ ...rem, is_synced: 1 });
                }
            }
            // Sincronizza Ambienti
            for (let rem of ambientiRemoti) {
                const loc = await db.ambienti.get(rem.id);
                if (!loc || new Date(rem.last_modified) > new Date(loc.last_modified)) {
                    await db.ambienti.put({ ...rem, is_synced: 1 });
                }
            }
        });

        console.log("🟢 Sincronizzazione Offline-First completata!");

    } catch (error) {
        console.error("🔴 Sincronizzazione fallita:", error);
    }
}