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

// Invece di usare il .where() che ignora gli 'undefined', peschiamo tutto
        const tuttiEdifici = await db.edifici.toArray();
        const tuttiAmbienti = await db.ambienti.toArray();

// Filtriamo a mano in Javascript: prendiamo quelli con 0 OPPURE i vecchi progetti (undefined)
        const edificiDaInviare = tuttiEdifici.filter(e => e.is_synced === 0 || e.is_synced === undefined);
        const ambientiDaInviare = tuttiAmbienti.filter(a => a.is_synced === 0 || a.is_synced === undefined);

// Prepariamo i payload per Supabase:
// 1. Togliamo is_synced (che a Supabase non piace)
// 2. Aggiungiamo lo user_id
// 3. Ci assicuriamo che ci sia una data in last_modified
        const edificiPayload = edificiDaInviare.map(({ is_synced, ...e }) => ({
            ...e,
            user_id: userId,
            last_modified: e.last_modified || new Date().toISOString()
        }));

        const ambientiPayload = ambientiDaInviare.map(({ is_synced, ...a }) => ({
            ...a,
            user_id: userId,
            last_modified: a.last_modified || new Date().toISOString()
        }));

// Mandiamo tutto su Supabase
        if (edificiPayload.length > 0) {
            const { error } = await supabase.from('edifici').upsert(edificiPayload);
            if (error) throw new Error(`Errore Push Edifici: ${error.message}`);
        }

        if (ambientiPayload.length > 0) {
            const { error } = await supabase.from('ambienti').upsert(ambientiPayload);
            if (error) throw new Error(`Errore Push Ambienti: ${error.message}`);
        }

// Aggiorniamo i record salvati in locale, segnandoli come sincronizzati (1) e aggiungendo il user_id locale
        await db.transaction('rw', db.edifici, db.ambienti, async () => {
            for (let e of edificiDaInviare) {
                await db.edifici.update(e.id, { is_synced: 1, user_id: userId });
            }
            for (let a of ambientiDaInviare) {
                await db.ambienti.update(a.id, { is_synced: 1, user_id: userId });
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