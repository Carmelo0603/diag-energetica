import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/database";
import { ArrowLeft, Trash2, Lightbulb, MonitorPlay, Thermometer } from "lucide-react";
import FormRadiatore from "../components/FormRadiatore";
import FormApparecchio from "../components/FormApparecchio";

export default function RilievoAmbiente() {
  const { idAmbiente } = useParams();
  const [tipoInserimento, setTipoInserimento] = useState("luci");

  const ambiente = useLiveQuery(() => db.ambienti.get(idAmbiente));

  if (ambiente === undefined) return <div className="p-6 font-bold uppercase">Accesso in corso...</div>;
  if (ambiente === null) return <div className="p-6 font-bold uppercase text-red-500">Errore: Ambiente non trovato.</div>;

  const elementi = ambiente.elementi_inseriti || [];

  const handleAggiungiElemento = async (nuovoElemento) => {
    const elementiAggiornati = [...elementi, nuovoElemento];
    await db.ambienti.update(idAmbiente, { elementi_inseriti: elementiAggiornati });
  };

  const handleRimuoviElemento = async (idIstanza) => {
    const elementiAggiornati = elementi.filter((el) => el.id_istanza !== idIstanza);
    await db.ambienti.update(idAmbiente, { elementi_inseriti: elementiAggiornati });
  };

  return (
    <div className="space-y-12">
      <div className="border-4 border-white p-6">
        <Link
          to={`/edificio/${ambiente.id_edificio}`}
          className="inline-flex items-center font-bold text-white hover:text-green-500 mb-4 transition-none uppercase"
        >
          <ArrowLeft size={20} className="mr-2" /> Torna all'Edificio
        </Link>
        <div className="flex flex-col sm:flex-row justify-between items-start">
          <div>
            <h2 className="text-4xl font-black tracking-tighter uppercase">{ambiente.nome}</h2>
            <p className="font-bold text-green-500 mt-2 uppercase">TARGET: {ambiente.lux_normativi} LUX</p>
          </div>
          <div className="mt-4 sm:mt-0 border-4 border-white p-4 text-center min-w-[120px]">
            <span className="block text-4xl font-black">{elementi.length}</span>
            <span className="font-bold uppercase tracking-widest text-sm">Asset</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-0 border-4 border-white">
        <button
          onClick={() => setTipoInserimento("luci")}
          className={`flex flex-col items-center justify-center py-6 font-black uppercase text-sm sm:text-lg transition-none border-r-4 border-white last:border-r-0 ${tipoInserimento === "luci" ? "bg-white text-black" : "bg-black text-white hover:bg-green-500 hover:text-black"}`}
        >
          <Lightbulb size={32} className="mb-2" /> Luci
        </button>
        <button
          onClick={() => setTipoInserimento("apparecchi")}
          className={`flex flex-col items-center justify-center py-6 font-black uppercase text-sm sm:text-lg transition-none border-r-4 border-white last:border-r-0 ${tipoInserimento === "apparecchi" ? "bg-white text-black" : "bg-black text-white hover:bg-green-500 hover:text-black"}`}
        >
          <MonitorPlay size={32} className="mb-2" /> Apparecchi
        </button>
        <button
          onClick={() => setTipoInserimento("termico")}
          className={`flex flex-col items-center justify-center py-6 font-black uppercase text-sm sm:text-lg transition-none border-r-4 border-white last:border-r-0 ${tipoInserimento === "termico" ? "bg-white text-black" : "bg-black text-white hover:bg-green-500 hover:text-black"}`}
        >
          <Thermometer size={32} className="mb-2" /> Termico
        </button>
      </div>

      <div className="border-4 border-white p-6">
        {tipoInserimento === "termico" ? (
          <FormRadiatore onSalva={handleAggiungiElemento} />
        ) : (
          <FormApparecchio onSalva={handleAggiungiElemento} tipoForm={tipoInserimento} />
        )}
      </div>

      <div className="space-y-4 pb-12">
        <h3 className="text-xl font-black uppercase tracking-tighter mb-6 flex items-center gap-2">Inventario</h3>
        {elementi.length === 0 ? (
          <p className="font-bold uppercase p-6 border-2 border-dashed border-white text-center">Nessun asset censito.</p>
        ) : (
          <div className="grid gap-4">
            {elementi.map((el) => (
              <div key={el.id_istanza} className="border-2 border-white p-4 flex justify-between items-center">
                <div>
                  <p className="text-xl font-black uppercase">{el.categoria === "termico" ? `${el.tipologia} (${el.altezza_label})` : el.label}</p>
                  <p className="font-bold mt-2 uppercase">
                    <span className="text-black bg-green-500 px-2 py-1 mr-3">{el.categoria}</span>
                    {el.categoria === "termico" ? `N. ${el.numero_elementi} EL. | ${el.carico_totale_w} W` : `Q.TA: ${el.quantita} | ${el.carico_totale_w} W`}
                  </p>
                  {el.note && <p className="font-bold text-sm uppercase mt-3 opacity-80">NOTE: {el.note}</p>}
                </div>
                <button onClick={() => handleRimuoviElemento(el.id_istanza)} className="text-white hover:text-green-500 p-4 transition-none">
                  <Trash2 size={32} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
