import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { db } from '../db/database';
import { Search, X, Building2, DoorOpen, Zap } from 'lucide-react';

export default function SearchBar({ idEdificio, idAmbiente, placeholder }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState({ edifici: [], ambienti: [], elementi: [] });
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();

    // Svuota la barra se cambi pagina
    useEffect(() => {
        setQuery('');
        setIsOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        const eseguiRicerca = async () => {
            if (query.trim().length < 2) {
                setResults({ edifici: [], ambienti: [], elementi: [] });
                return;
            }

            const q = query.toLowerCase();
            let edifici = [];
            let ambienti = [];
            let elementi = [];

            if (idAmbiente) {
                // 1. Contesto: Dentro una stanza. Cerca solo asset.
                const amb = await db.ambienti.get(idAmbiente);
                if (amb && amb.elementi_inseriti) {
                    amb.elementi_inseriti.forEach(el => {
                        const labelEl = el.label || el.tipologia || el.categoria;
                        if (labelEl.toLowerCase().includes(q) || (el.note && el.note.toLowerCase().includes(q))) {
                            elementi.push({ ...el, ambienteId: amb.id, ambienteNome: amb.nome });
                        }
                    });
                }
            } else if (idEdificio) {
                // 2. Contesto: Dentro un edificio. Cerca solo stanze.
                const allAmbienti = await db.ambienti.where('id_edificio').equals(idEdificio).toArray();
                ambienti = allAmbienti.filter(amb =>
                    amb.nome.toLowerCase().includes(q) || (amb.piano && amb.piano.toLowerCase().includes(q))
                );
            } else {
                // 3. Contesto: Dashboard. Cerca solo edifici.
                const allEdifici = await db.edifici.toArray();
                edifici = allEdifici.filter(e =>
                    e.nome.toLowerCase().includes(q) ||
                    (e.pods && e.pods.some(p => p.toLowerCase().includes(q))) ||
                    (e.pdr && e.pdr.toLowerCase().includes(q))
                );
            }

            setResults({ edifici, ambienti, elementi });
            setIsOpen(true);
        };

        eseguiRicerca();
    }, [query, idEdificio, idAmbiente]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) setIsOpen(false);
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleNavigate = (path) => {
        navigate(path);
        setIsOpen(false);
        setQuery('');
    };

    return (
        <div ref={wrapperRef} className="relative w-full max-w-md mx-auto z-50">
            <div className="relative flex items-center">
                <div className="absolute left-4 text-white"><Search size={20} /></div>
                <input
                    type="text"
                    placeholder={placeholder}
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
                    onFocus={() => { if (query.length >= 2) setIsOpen(true); }}
                    className="w-full bg-black border-2 border-white pl-12 pr-12 py-3 focus:outline-none focus:border-green-500 focus:bg-green-500 focus:text-black text-white uppercase font-bold placeholder:text-zinc-500 transition-none"
                />
                {query && <button onClick={() => {setQuery(''); setIsOpen(false)}} className="absolute right-4 text-white hover:text-red-500"><X size={20} /></button>}
            </div>

            {isOpen && query.length >= 2 && (results.edifici.length > 0 || results.ambienti.length > 0 || results.elementi.length > 0) && (
                <div className="absolute top-full left-0 w-full mt-1 bg-black border-4 border-white max-h-96 overflow-y-auto shadow-2xl flex flex-col">

                    {results.edifici.length > 0 && (
                        <div>
                            <div className="bg-zinc-900 text-green-500 font-black text-xs px-4 py-2 uppercase flex items-center gap-2"><Building2 size={14}/> Cantieri</div>
                            {results.edifici.map(ed => (
                                <button key={ed.id} onClick={() => handleNavigate(`/edificio/${ed.id}`)} className="w-full text-left p-4 hover:bg-green-500 hover:text-black block border-b border-zinc-800 last:border-0 transition-none">
                                    <span className="font-black uppercase block">{ed.nome}</span>
                                    <span className="text-xs font-bold text-zinc-400 block">{ed.tipologia}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {results.ambienti.length > 0 && (
                        <div>
                            <div className="bg-zinc-900 text-green-500 font-black text-xs px-4 py-2 uppercase flex items-center gap-2"><DoorOpen size={14}/> Stanze</div>
                            {results.ambienti.map(amb => (
                                <button key={amb.id} onClick={() => handleNavigate(`/ambiente/${amb.id}`)} className="w-full text-left p-4 hover:bg-green-500 hover:text-black block border-b border-zinc-800 last:border-0 transition-none">
                                    <span className="font-black uppercase block">{amb.nome}</span>
                                    <span className="text-xs font-bold text-zinc-400 block">PIANO: {amb.piano || '-'}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {results.elementi.length > 0 && (
                        <div>
                            <div className="bg-zinc-900 text-green-500 font-black text-xs px-4 py-2 uppercase flex items-center gap-2"><Zap size={14}/> Asset Inventario</div>
                            {results.elementi.map(el => (
                                <button key={el.id_istanza} onClick={() => setIsOpen(false)} className="w-full text-left p-4 hover:bg-green-500 hover:text-black block border-b border-zinc-800 last:border-0 transition-none">
                                    <span className="font-black uppercase block">{el.label || el.tipologia || el.categoria}</span>
                                    <span className="text-xs font-bold text-zinc-400 block">CATEGORIA: {el.categoria}</span>
                                </button>
                            ))}
                        </div>
                    )}

                </div>
            )}
        </div>
    );
}