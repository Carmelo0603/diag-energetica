import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/database";
import { NORMATIVA_LUX } from "../data/normativa_lux";
import { Plus, Building2, ChevronRight } from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const [nomeProgetto, setNomeProgetto] = useState("");
  const [macroCategoria, setMacroCategoria] = useState("");
  const [tipologiaSpecifica, setTipologiaSpecifica] = useState("");

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
      data_creazione: new Date().toISOString(),
    });

    navigate(`/edificio/${id}`);
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
            <Link
              key={edificio.id}
              to={`/edificio/${edificio.id}`}
              className="border-2 border-white p-6 flex items-center justify-between hover:bg-green-500 hover:text-black hover:border-green-500 transition-none group"
            >
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tighter">{edificio.nome}</h3>
                <p className="text-sm font-bold mt-2 uppercase opacity-80">{NORMATIVA_LUX[edificio.tipologia]?.label || edificio.tipologia}</p>
              </div>
              <ChevronRight size={32} className="group-hover:text-black" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
