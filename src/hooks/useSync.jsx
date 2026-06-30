import { useEffect } from 'react';
import { syncData } from '../utils/sync';
import { useAuth } from '../context/AuthContext';

export default function useSync() {
    const { session } = useAuth();

    useEffect(() => {
        // Non avviare se l'utente non è loggato
        if (!session) return;

        // 1. Sincronizza appena il componente viene montato (es. apro l'app)
        syncData();

        // 2. Sincronizza quando la connessione torna attiva (magia dell'evento 'online')
        const handleOnline = () => {
            console.log("🌐 Connessione ristabilita. Avvio sincronizzazione...");
            syncData();
        };

        window.addEventListener('online', handleOnline);

        // 3. Sincronizzazione periodica (opzionale, ma da Senior la mettiamo ogni 3 minuti)
        const interval = setInterval(() => {
            syncData();
        }, 3 * 60 * 1000);

        return () => {
            window.removeEventListener('online', handleOnline);
            clearInterval(interval);
        };
    }, [session]);
}