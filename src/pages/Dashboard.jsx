import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { NORMATIVA_LUX } from '../data/normativa_lux';
import { Plus, Building2, ChevronRight, Trash2, Edit3 } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();

  const [nomeProgetto, setNomeProgetto] = useState('');
  const [macroCategoria, setMacroCategoria] = useState('');
  const [tipologiaSpecifica, setTipologiaSpecifica] = useState('');
  const [noteAggiuntive, setNoteAggiuntive] = useState('');
  const [edificioInModifica, setEdificioInModifica] = useState(null);

  const [ordinamento, setOrdinamento] = useState('data_desc');

  const edificiRaw = useLiveQuery(() => db.edifici.filter(e => !e._deleted).toArray());

  const edifici = [...(edificiRaw || [])].sort((a, b) => {
    const timeA = new Date(a.data_creazione).getTime();
    const timeB = new Date(b.data_creazione).getTime();
    if (ordinamento === 'data_desc') return timeB - timeA;
    if (ordinamento === 'data_asc') return timeA - timeB;
    if (ordinamento === 'alfa_asc') return (a.nome || '').localeCompare(b.nome || '');
    if (ordinamento === 'alfa_desc') return (b.nome || '').localeCompare(a.nome || '');
    return 0;
  });

  const handleCreaOAggiornaEdificio = async (e) => {
    e.preventDefault();
    const tipologiaFinale = macroCategoria === 'condominio' ? tipologiaSpecifica : macroCategoria;
    if (!nomeProgetto || !tipologiaFinale) return;

    if (edificioInModifica) {
      await db.edifici.update(edificioInModifica, {
        nome: nomeProgetto,
        macro_categoria: macroCategoria,
        tipologia: tipologiaFinale,
        note: noteAggiuntive.trim(),
        is_synced: 0,
        last_modified: new Date().toISOString()
      });
      setEdificioInModifica(null);
      setNomeProgetto(''); setMacroCategoria(''); setTipologiaSpecifica(''); setNoteAggiuntive('');
    } else {
      const id = `bld_${crypto.randomUUID()}`;
      await db.edifici.add({
        id,
        nome: nomeProgetto,
        macro_categoria: macroCategoria,
        tipologia: tipologiaFinale,
        pods: [],
        pdr: '',
        note: noteAggiuntive.trim(),
        data_creazione: new Date().toISOString(),
        is_synced: 0,
        last_modified: new Date().toISOString()
      });
      setNomeProgetto(''); setMacroCategoria(''); setTipologiaSpecifica(''); setNoteAggiuntive('');
      navigate(`/edificio/${id}`);
    }
  };

  const handleEliminaEdificio = async (e, id) => {
    e.preventDefault();
    if (window.confirm("Attenzione: eliminando il cantiere cancellerai tutte le sue stanze e l'intero inventario. Procedere?")) {
      await db.edifici.update(id, { _deleted: true, is_synced: 0, last_modified: new Date().toISOString() });
      const ambs = await db.ambienti.where('id_edificio').equals(id).toArray();
      for (let a of ambs) {
        await db.ambienti.update(a.id, { _deleted: true, is_synced: 0, last_modified: new Date().toISOString() });
      }
    }
  };

  const avviaModificaEdificio = (e, ed) => {
    e.preventDefault();
    setEdificioInModifica(ed.id);
    setNomeProgetto(ed.nome);
    setMacroCategoria(ed.macro_categoria);
    setTipologiaSpecifica(ed.macro_categoria === 'condominio' ? ed.tipologia : '');
    setNoteAggiuntive(ed.note || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const annullaModifica = () => {
    setEdificioInModifica(null);
    setNomeProgetto(''); setMacroCategoria(''); setTipologiaSpecifica(''); setNoteAggiuntive('');
  };

  return (
      <div className="space-y-12">
        <section className="border-4 border-white p-6">
          <h2 className="text-xl font-black uppercase tracking-tighter mb-6 flex items-center gap-2">
            <Plus size={24} className="text-green-500" /> {edificioInModifica ? 'Modifica Cantiere' : 'Nuovo Cantiere'}
          </h2>

          <form onSubmit={handleCreaOAggiornaEdificio} className="flex flex-col gap-6">
            <div>
              <label className="block text-sm font-bold uppercase mb-2">Nome / Riferimento</label>
              <input
                  type="text"
                  required
                  value={nomeProgetto}
                  onChange={(e) => setNomeProgetto(e.target.value)}
                  className="w-full bg-black border-2 border-white p-4 text-lg focus:outline-none focus:border-green-500 text-white"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold uppercase mb-2">Tipo Fabbricato</label>
                <select
                    required
                    value={macroCategoria}
                    onChange={(e) => { setMacroCategoria(e.target.value); setTipologiaSpecifica(''); }}
                    className="w-full bg-black border-2 border-white p-4 text-lg focus:outline-none focus:border-green-500 text-white appearance-none rounded-none"
                >
                  <option value="">-- SELEZIONA --</option>
                  <option value="condominio">CONDOMINIO</option>
                  <option value="residenziale">ABITAZIONE SINGOLA</option>
                  <option value="ufficio">EDIFICIO UFFICI</option>
                  <option value="scuola">STRUTTURA SCOLASTICA</option>
                  <option value="casa_riposo">CASE DI RIPOSO / RSA</option>
                </select>
              </div>

              {macroCategoria === 'condominio' && (
                  <div>
                    <label className="block text-sm font-bold uppercase text-green-500 mb-2">Destinazione Condominio</label>
                    <select
                        required
                        value={tipologiaSpecifica}
                        onChange={(e) => setTipologiaSpecifica(e.target.value)}
                        className="w-full bg-black border-2 border-green-500 p-4 text-lg focus:outline-none focus:bg-green-500 focus:text-black text-white appearance-none rounded-none"
                    >
                      <option value="">-- SPECIFICA --</option>
                      <option value="residenziale">RESIDENZIALE</option>
                      <option value="ufficio">COMMERCIALE / UFFICI</option>
                    </select>
                  </div>
              )}

              <div className="md:col-span-2">
                <label className="block text-sm font-bold uppercase mb-2">Note / Info Aggiuntive (Opzionale)</label>
                <textarea
                    value={noteAggiuntive}
                    onChange={(e) => setNoteAggiuntive(e.target.value)}
                    placeholder="ES. ACCESSO DA VIA ROMA, CHIAVI DAL CUSTODE..."
                    className="w-full bg-black border-2 border-dashed border-white p-4 text-lg focus:outline-none focus:border-solid focus:border-green-500 text-white min-h-[100px]"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-4">
              <button
                  type="submit"
                  className="flex-1 bg-white text-black font-black text-xl py-4 border-4 border-white hover:bg-green-500 hover:border-green-500 hover:text-black transition-none uppercase"
              >
                {edificioInModifica ? 'Aggiorna Cantiere' : 'Inizializza'}
              </button>
              {edificioInModifica && (
                  <button type="button" onClick={annullaModifica} className="bg-black text-white border-4 border-white px-8 font-black uppercase text-sm hover:border-red-500 hover:text-red-500 transition-none">
                    Annulla
                  </button>
              )}
            </div>
          </form>
        </section>

        <section>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
              <Building2 size={24} className="text-green-500" /> Archivio Rilievi
            </h2>
            <select
                value={ordinamento}
                onChange={(e) => setOrdinamento(e.target.value)}
                className="bg-black border-2 border-zinc-700 text-zinc-400 p-2 uppercase text-xs font-bold focus:border-green-500 focus:text-green-500 outline-none cursor-pointer"
            >
              <option value="data_desc">Ordina: Più recenti</option>
              <option value="data_asc">Ordina: Meno recenti</option>
              <option value="alfa_asc">Ordina: Alfabetico (A-Z)</option>
              <option value="alfa_desc">Ordina: Alfabetico (Z-A)</option>
            </select>
          </div>

          {(!edifici || edifici.length === 0) ? (
              <p className="font-bold uppercase p-6 border-2 border-dashed border-zinc-700 text-center text-zinc-500">Nessun cantiere trovato.</p>
          ) : (
              <div className="grid gap-4">
                {edifici.map((edificio) => (
                    <div key={edificio.id} className={`border-2 border-white p-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4 ${edificioInModifica === edificio.id ? 'border-green-500 bg-green-950' : 'hover:border-green-500'}`}>
                      <div className="flex-1">
                        <Link to={`/edificio/${edificio.id}`} className="group block">
                          <h3 className="text-2xl font-black uppercase tracking-tighter group-hover:text-green-500">{edificio.nome}</h3>
                          <p className="text-sm font-bold mt-2 uppercase opacity-80 text-zinc-400">{NORMATIVA_LUX[edificio.tipologia]?.label || edificio.tipologia}</p>
                          {edificio.note && <p className="text-xs font-bold mt-2 text-zinc-500 uppercase border-l-2 border-green-500 pl-2">NOTE: {edificio.note}</p>}
                        </Link>
                      </div>
                      <div className="flex gap-2 border-t-2 border-dashed sm:border-0 border-zinc-800 pt-3 sm:pt-0 justify-end">
                        <button onClick={(e) => avviaModificaEdificio(e, edificio)} className="p-2 border border-white hover:bg-white hover:text-black text-white"><Edit3 size={18}/></button>
                        <button onClick={(e) => handleEliminaEdificio(e, edificio.id)} className="p-2 border border-red-500 text-red-500 hover:bg-red-500 hover:text-black"><Trash2 size={18}/></button>
                        <Link to={`/edificio/${edificio.id}`} className="p-2 border border-green-500 text-green-500 hover:bg-green-500 hover:text-black"><ChevronRight size={18}/></Link>
                      </div>
                    </div>
                ))}
              </div>
          )}
        </section>
      </div>
  );
}