import { db } from '../db/database';
import { supabase } from '../lib/supabaseClient';

export async function syncData() {
    if (!navigator.onLine) return;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const userId = session.user.id;

    try {
        console.log("🔄 Inizio Sincronizzazione LWW (Senza Deep Merge)...");

        // ==========================================
        // FASE 1: GESTIONE ELIMINAZIONI (TOMBSTONES)
        // ==========================================
        const edificiEliminati = await db.edifici.filter(e => e._deleted === true).toArray();
        const ambientiEliminati = await db.ambienti.filter(a => a._deleted === true).toArray();

        if (edificiEliminati.length > 0) {
            const ids = edificiEliminati.map(e => e.id);
            await supabase.from('edifici').delete().in('id', ids);
            await db.edifici.bulkDelete(ids);
        }

        if (ambientiEliminati.length > 0) {
            const ids = ambientiEliminati.map(a => a.id);
            await supabase.from('ambienti').delete().in('id', ids);
            await db.ambienti.bulkDelete(ids);
        }

        // ==========================================
        // FASE 2: PULL INIZIALE
        // ==========================================
        const { data: edificiRemoti, error: errEdifici } = await supabase.from('edifici').select('*');
        const { data: ambientiRemoti, error: errAmbienti } = await supabase.from('ambienti').select('*');

        if (errEdifici || errAmbienti) throw new Error("Errore durante il Pull pre-merge da Supabase");

        const remotiEdificiMap = new Map((edificiRemoti || []).map(e => [e.id, e]));
        const remotiAmbientiMap = new Map((ambientiRemoti || []).map(a => [a.id, a]));

        // Filtriamo via i tombstone che non abbiamo fatto in tempo a cancellare
        const tuttiEdifici = await db.edifici.filter(e => !e._deleted).toArray();
        const tuttiAmbienti = await db.ambienti.filter(a => !a._deleted).toArray();

        const payloadEdifici = [];
        const payloadAmbienti = [];

        // ==========================================
        // FASE 3: LWW (LAST WRITE WINS) E PUSH
        // ==========================================
        for (let loc of tuttiEdifici) {
            if (loc.is_synced === 0 || loc.is_synced === undefined) {
                const rem = remotiEdificiMap.get(loc.id);
                if (rem) {
                    const locTime = new Date(loc.last_modified || 0).getTime();
                    const remTime = new Date(rem.last_modified || 0).getTime();
                    // LWW: Se il server ha una versione più recente, vince lui e la teniamo
                    if (remTime > locTime) {
                        Object.assign(loc, rem);
                    }
                }
                loc.user_id = userId;
                loc.last_modified = loc.last_modified || new Date().toISOString();
                payloadEdifici.push(loc);
            }
        }

        for (let loc of tuttiAmbienti) {
            if (loc.is_synced === 0 || loc.is_synced === undefined) {
                const rem = remotiAmbientiMap.get(loc.id);
                if (rem) {
                    const locTime = new Date(loc.last_modified || 0).getTime();
                    const remTime = new Date(rem.last_modified || 0).getTime();
                    if (remTime > locTime) {
                        Object.assign(loc, rem);
                    }
                }
                loc.user_id = userId;
                loc.last_modified = loc.last_modified || new Date().toISOString();
                payloadAmbienti.push(loc);
            }
        }

        const cleanEdificiPush = payloadEdifici.map(({ is_synced, _deleted, ...e }) => e);
        const cleanAmbientiPush = payloadAmbienti.map(({ is_synced, _deleted, ...a }) => a);

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

            // Elimina dal tablet i record rimossi dal cloud dai colleghi
            const remoteEdificiIds = new Set((finalEdifici || []).map(e => e.id));
            for (let loc of tuttiEdifici) {
                if (!remoteEdificiIds.has(loc.id) && loc.is_synced === 1) await db.edifici.delete(loc.id);
            }

            const remoteAmbientiIds = new Set((finalAmbienti || []).map(a => a.id));
            for (let loc of tuttiAmbienti) {
                if (!remoteAmbientiIds.has(loc.id) && loc.is_synced === 1) await db.ambienti.delete(loc.id);
            }
        });

        console.log("🟢 Sync Bi-direzionale LWW completato con successo!");

    } catch (error) {
        console.error("🔴 Sincronizzazione fallita:", error);
        throw error;
    }
}