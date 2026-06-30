import { useState, useEffect } from 'react';
import { Outlet, Link, useParams, useLocation, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { Download, ChevronDown, LogOut } from 'lucide-react';
import { esportaRilievoExcel } from '../utils/exportExcel';
import SearchBar from './SearchBar';
import useSync from "../hooks/useSync";
import { supabase } from '../lib/supabaseClient';

export default function Layout() {
    const { idEdificio, idAmbiente } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [exportMenuOpen, setExportMenuOpen] = useState(false);
    useSync();

    useEffect(() => {
        setExportMenuOpen(false);
    }, [location.pathname]);

    const ambiente = useLiveQuery(() => idAmbiente ? db.ambienti.get(idAmbiente) : null, [idAmbiente]);
    const effEdificioId = idEdificio || (ambiente ? ambiente.id_edificio : null);
    const edificio = useLiveQuery(() => effEdificioId ? db.edifici.get(effEdificioId) : null, [effEdificioId]);

    const handleExport = (tipo) => {
        setExportMenuOpen(false);
        esportaRilievoExcel(effEdificioId, tipo);
    };

    const handleLogout = async () => {
        const confermato = window.confirm(
            "ATTENZIONE: Stai per uscire. Assicurati che l'app abbia sincronizzato i dati (notifica verde in basso), altrimenti perderai le ultime modifiche offline. Vuoi procedere?"
        );

        if (confermato) {
            try {
                // Svuotiamo il database locale per impedire al prossimo utente di vedere/sporcare i dati
                await db.transaction('rw', db.edifici, db.ambienti, async () => {
                    await db.edifici.clear();
                    await db.ambienti.clear();
                });

                // Disconnessione effettiva da Supabase
                await supabase.auth.signOut();

                // Il redirect ci riporta brutalmente alla pagina di login
                navigate('/login');
            } catch (error) {
                console.error("Errore durante il logout:", error);
                alert("Si è verificato un errore durante la disconnessione.");
            }
        }
    };

    let searchPlaceholder = "CERCA CANTIERI O FORNITURE...";
    if (idAmbiente) searchPlaceholder = "CERCA NELL'INVENTARIO...";
    else if (idEdificio) searchPlaceholder = "CERCA STANZE O PIANI...";

    return (
        <div className="min-h-screen flex flex-col bg-black text-white font-sans">
            <header className="border-b-4 border-white p-6 sticky top-0 z-50 bg-black flex flex-col items-center gap-4 relative">

                {/* Pulsante Logout */}
                <button
                    onClick={handleLogout}
                    className="absolute left-4 top-4 z-50 bg-black text-white p-2 border-2 border-white hover:bg-red-500 hover:border-red-500 hover:text-black transition-none flex items-center gap-2 shadow-md"
                    title="Disconnetti account"
                >
                    <LogOut size={24} />
                    <span className="hidden sm:inline font-black uppercase text-sm">Esci</span>
                </button>

                <Link to="/" className="font-mono text-4xl font-black tracking-tighter hover:text-green-500 transition-colors uppercase mt-8 sm:mt-0">
                    UBIARCHIUM
                </Link>

                <SearchBar idEdificio={effEdificioId} idAmbiente={idAmbiente} placeholder={searchPlaceholder} />

                {edificio && (
                    <div className="absolute right-4 top-4 z-50">
                        <button
                            onClick={() => setExportMenuOpen(!exportMenuOpen)}
                            className="bg-white text-black p-2 hover:bg-green-500 border-2 border-white hover:border-green-500 flex items-center gap-1 transition-none shadow-md"
                        >
                            <Download size={24} />
                            <ChevronDown size={16} />
                        </button>
                        {exportMenuOpen && (
                            <div className="absolute right-0 top-full mt-2 w-64 bg-black border-4 border-white flex flex-col shadow-2xl">
                                <button onClick={() => handleExport('tutto')} className="p-4 text-left font-black uppercase text-sm hover:bg-green-500 hover:text-black border-b-2 border-zinc-800 transition-none">TABELLA COMPLETA</button>
                                <button onClick={() => handleExport('illuminazione')} className="p-4 text-left font-black uppercase text-sm hover:bg-green-500 hover:text-black border-b-2 border-zinc-800 transition-none">ILLUMINAZIONE</button>
                                <button onClick={() => handleExport('termico')} className="p-4 text-left font-black uppercase text-sm hover:bg-green-500 hover:text-black border-b-2 border-zinc-800 transition-none">TERMICO</button>
                                <button onClick={() => handleExport('infissi')} className="p-4 text-left font-black uppercase text-sm hover:bg-green-500 hover:text-black border-b-2 border-zinc-800 transition-none">INFISSI</button>
                                <button onClick={() => handleExport('apparecchi')} className="p-4 text-left font-black uppercase text-sm hover:bg-green-500 hover:text-black border-b-2 border-zinc-800 transition-none">APPARECCHI</button>
                                <button onClick={() => handleExport('elettrico')} className="p-4 text-left font-black uppercase text-sm hover:bg-green-500 hover:text-black transition-none">RIEPILOGO ELETTRICO</button>
                            </div>
                        )}
                    </div>
                )}

                {edificio && (
                    <div className="w-full max-w-4xl mt-2 bg-green-500 text-black font-mono text-[11px] font-black uppercase tracking-wider py-2 px-4 flex flex-col sm:flex-row justify-center items-center text-center border-2 border-black gap-2 sm:gap-4">
                        <span>Cantiere: {edificio.nome}</span>
                        {ambiente && (
                            <>
                                <span className="hidden sm:inline">|</span>
                                <span>Stanza: {ambiente.nome}</span>
                            </>
                        )}
                    </div>
                )}
            </header>

            <main className="flex-1 p-6 w-full max-w-4xl mx-auto">
                <Outlet />
            </main>
        </div>
    );
}