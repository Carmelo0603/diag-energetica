import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/database";
import { NORMATIVA_LUX } from "../data/normativa_lux";
import { Plus, Building2, ChevronRight, Trash2, Edit3 } from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const [nomeProgetto, setNomeProgetto] = useState("");
  const [macroCategoria, setMacroCategoria] = useState("");
  const [tipologiaSpecifica, setTipologiaSpecifica] = useState("");

  const [edificioInModifica, setEdificioInModifica] = useState(null);
  const [nuovoNomeEdificio, setNuovoNomeEdificio] = useState("");

  const edifici = useLiveQuery(() => db.edifici.orderBy("data_creazione").reverse().toArray());

  const handleCreaEdificio = async (e) => {
    e.preventDefault();
    const tipologiaFinale = macroCategoria === "condominio" ? tipologiaSpecifica : macroCategoria;
    if (!nomeProgetto || !tipologiaFinale) return;

    const id = `bld_${crypto.randomUUID()}`;

    await db.edifici.add({
      id,
      nome: nomeProgetto,
      macro_categoria: macroCategoria,
      tipologia: tipologiaFinale,
      pods: [],
      pdr: "",
      data_creazione: new Date().toISOString(),
    });

    setNomeProgetto("");
    setMacroCategoria("");
    setTipologiaSpecifica("");
    navigate(`/edificio/${id}`);
  };

  const handleEliminaEdificio = async (e, id) => {
    e.preventDefault();
    if (window.confirm("Attenzione: eliminando il cantiere cancellerai tutte le sue stanze e l'intero inventario. Procedere?")) {
      await db.edifici.delete(id);
      await db.ambienti.where("id_edificio").equals(id).delete();
    }
  };

  const avviaModificaEdificio = (e, ed) => {
    e.preventDefault();
    setEdificioInModifica(ed.id);
    setNuovoNomeEdificio(ed.nome);
  };

  const salvaModificaEdificio = async (e, id) => {
    e.preventDefault();
    if (!nuovoNomeEdificio.trim()) return;
    await db.edifici.update(id, { nome: nuovoNomeEdificio.trim() });
    setEdificioInModifica(null);
  };

  return (
    <div className="space-y-12">
      <section className="border-4 border-white p-6">
        <h2 className="text-xl font-black uppercase tracking-tighter mb-6 flex items-center gap-2">
          <Plus size={24} className="text-green-500" /> Nuovo Cantiere
        </h2>

        <form onSubmit={handleCreaEdificio} className="flex flex-col gap-6">
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
                onChange={(e) => {
                  setMacroCategoria(e.target.value);
                  setTipologiaSpecifica("");
                }}
                className="w-full bg-black border-2 border-white p-4 text-lg focus:outline-none focus:border-green-500 text-white appearance-none rounded-none"
              >
                <option value="">-- SELEZIONA --</option>
                <option value="condominio">CONDOMINIO</option>
                <option value="residenziale">ABITAZIONE SINGOLA</option>
                <option value="ufficio">EDIFICIO UFFICI</option>
                <option value="scuola">STRUTTURA SCOLASTICA</option>
              </select>
            </div>

            {macroCategoria === "condominio" && (
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
          </div>

          <button
            type="submit"
            className="w-full bg-white text-black font-black text-xl py-4 mt-4 border-4 border-white hover:bg-green-500 hover:border-green-500 hover:text-black transition-none uppercase"
          >
            Inizializza
          </button>
        </form>
      </section>

      <section>
        <h2 className="text-xl font-black uppercase tracking-tighter mb-6 flex items-center gap-2">
          <Building2 size={24} className="text-green-500" /> Archivio Rilievi
        </h2>
        <div className="grid gap-4">
          {edifici?.map((edificio) => (
            <div key={edificio.id} className="border-2 border-white p-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div className="flex-1">
                {edificioInModifica === edificio.id ? (
                  <form onSubmit={(e) => salvaModificaEdificio(e, edificio.id)} className="flex gap-2 w-full">
                    <input
                      type="text"
                      value={nuovoNomeEdificio}
                      onChange={(e) => setNuovoNomeEdificio(e.target.value)}
                      className="bg-black border-2 border-green-500 p-2 text-white font-bold flex-1"
                    />
                    <button type="submit" className="bg-green-500 text-black px-4 font-bold text-xs uppercase">
                      Salva
                    </button>
                    <button type="button" onClick={() => setEdificioInModifica(null)} className="border-2 border-white px-4 font-bold text-xs uppercase">
                      Annulla
                    </button>
                  </form>
                ) : (
                  <Link to={`/edificio/${edificio.id}`} className="group block">
                    <h3 className="text-2xl font-black uppercase tracking-tighter group-hover:text-green-500">{edificio.nome}</h3>
                    <p className="text-sm font-bold mt-2 uppercase opacity-80 text-zinc-400">
                      {NORMATIVA_LUX[edificio.tipologia]?.label || edificio.tipologia}
                    </p>
                  </Link>
                )}
              </div>
              <div className="flex gap-2 border-t-2 border-dashed sm:border-0 border-zinc-800 pt-3 sm:pt-0 justify-end">
                <button onClick={(e) => avviaModificaEdificio(e, edificio)} className="p-2 border border-white hover:bg-white hover:text-black text-white">
                  <Edit3 size={18} />
                </button>
                <button
                  onClick={(e) => handleEliminaEdificio(e, edificio.id)}
                  className="p-2 border border-red-500 text-red-500 hover:bg-red-500 hover:text-black"
                >
                  <Trash2 size={18} />
                </button>
                <Link to={`/edificio/${edificio.id}`} className="p-2 border border-green-500 text-green-500 hover:bg-green-500 hover:text-black">
                  <ChevronRight size={18} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
