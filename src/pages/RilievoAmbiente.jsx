import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/database";
import { ArrowLeft, Trash2, Lightbulb, MonitorPlay, Thermometer, PenLine, Grid } from "lucide-react";
import FormTermico from "../components/FormTermico";
import FormApparecchio from "../components/FormApparecchio";
import FormInfissi from "../components/FormInfissi";

export default function RilievoAmbiente() {
  const { idAmbiente } = useParams();
  const [tipoInserimento, setTipoInserimento] = useState("luci");
  const [elementoInModifica, setElementoInModifica] = useState(null);

  const ambiente = useLiveQuery(() => db.ambienti.get(idAmbiente));

  if (!ambiente) return null;

  const elementi = ambiente.elementi_inseriti || [];

  const handleSalvaElemento = async (elementoCorrente) => {
    let elementiAggiornati;
    if (elementoInModifica) {
      elementiAggiornati = elementi.map((el) => (el.id_istanza === elementoCorrente.id_istanza ? elementoCorrente : el));
      setElementoInModifica(null);
    } else {
      elementiAggiornati = [...elementi, elementoCorrente];
    }
    await db.ambienti.update(idAmbiente, { elementi_inseriti: elementiAggiornati });
  };

  const handleRimuoviElemento = async (idIstanza) => {
    const elementiAggiornati = elementi.filter((el) => el.id_istanza !== idIstanza);
    await db.ambienti.update(idAmbiente, { elementi_inseriti: elementiAggiornati });
  };

  const impostaModifica = (el) => {
    setElementoInModifica(el);
    if (el.categoria === "termico") setTipoInserimento("termico");
    else if (el.categoria === "illuminazione") setTipoInserimento("luci");
    else if (el.categoria === "infissi") setTipoInserimento("infissi");
    else setTipoInserimento("apparecchi");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-12">
      <div className="border-4 border-white p-6">
        <Link to={`/edificio/${ambiente.id_edificio}`} className="inline-flex items-center font-bold text-white hover:text-green-500 mb-4 uppercase">
          <ArrowLeft size={20} className="mr-2" /> Fabbricato
        </Link>
        <div className="flex flex-col sm:flex-row justify-between items-start">
          <div>
            <h2 className="text-4xl font-black tracking-tighter uppercase">{ambiente.nome}</h2>
            <p className="font-bold text-green-500 mt-2 uppercase">
              {ambiente.mq} MQ | TARGET: {ambiente.lux_normativi} LUX
            </p>
          </div>
          <div className="mt-4 sm:mt-0 border-4 border-white p-4 text-center min-w-[120px]">
            <span className="block text-4xl font-black">{elementi.length}</span>
            <span className="font-bold uppercase tracking-widest text-sm">Asset</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-0 border-4 border-white">
        <button
          onClick={() => {
            setTipoInserimento("luci");
            setElementoInModifica(null);
          }}
          className={`flex flex-col items-center justify-center py-6 font-black uppercase text-xs sm:text-sm border-r-2 border-white ${tipoInserimento === "luci" ? "bg-white text-black" : "bg-black text-white hover:bg-green-500 hover:text-black"}`}
        >
          <Lightbulb size={24} className="mb-2" /> Luci
        </button>
        <button
          onClick={() => {
            setTipoInserimento("apparecchi");
            setElementoInModifica(null);
          }}
          className={`flex flex-col items-center justify-center py-6 font-black uppercase text-xs sm:text-sm border-r-2 border-white ${tipoInserimento === "apparecchi" ? "bg-white text-black" : "bg-black text-white hover:bg-green-500 hover:text-black"}`}
        >
          <MonitorPlay size={24} className="mb-2" /> Apparecchi
        </button>
        <button
          onClick={() => {
            setTipoInserimento("termico");
            setElementoInModifica(null);
          }}
          className={`flex flex-col items-center justify-center py-6 font-black uppercase text-xs sm:text-sm border-r-2 border-white ${tipoInserimento === "termico" ? "bg-white text-black" : "bg-black text-white hover:bg-green-500 hover:text-black"}`}
        >
          <Thermometer size={24} className="mb-2" /> Termico
        </button>
        <button
          onClick={() => {
            setTipoInserimento("infissi");
            setElementoInModifica(null);
          }}
          className={`flex flex-col items-center justify-center py-6 font-black uppercase text-xs sm:text-sm ${tipoInserimento === "infissi" ? "bg-white text-black" : "bg-black text-white hover:bg-green-500 hover:text-black"}`}
        >
          <Grid size={24} className="mb-2" /> Infissi
        </button>
      </div>

      <div className="border-4 border-white p-6">
        {tipoInserimento === "termico" && (
          <FormTermico onSalva={handleSalvaElemento} initialData={elementoInModifica} onAnnulla={() => setElementoInModifica(null)} />
        )}
        {tipoInserimento === "infissi" && (
          <FormInfissi onSalva={handleSalvaElemento} initialData={elementoInModifica} onAnnulla={() => setElementoInModifica(null)} />
        )}
        {(tipoInserimento === "luci" || tipoInserimento === "apparecchi") && (
          <FormApparecchio
            onSalva={handleSalvaElemento}
            tipoForm={tipoInserimento}
            initialData={elementoInModifica}
            onAnnulla={() => setElementoInModifica(null)}
          />
        )}
      </div>

      <div className="space-y-4 pb-12">
        <h3 className="text-xl font-black uppercase tracking-tighter mb-6">Inventario Stanza</h3>
        {elementi.length === 0 ? (
          <p className="font-bold uppercase p-6 border-2 border-dashed border-white text-center">Nessun asset censito.</p>
        ) : (
          <div className="grid gap-4">
            {elementi.map((el) => (
              <div
                key={el.id_istanza}
                className={`border-2 border-white p-4 flex flex-col sm:flex-row justify-between sm:items-center ${elementoInModifica?.id_istanza === el.id_istanza ? "bg-green-950 border-green-500" : ""}`}
              >
                <div>
                  <p className="text-xl font-black uppercase">
                    {el.categoria === "termico" && el.sotto_categoria === "split" ? el.label : ""}
                    {el.categoria === "termico" && el.sotto_categoria === "radiatore" ? `${el.tipologia} (${el.altezza_label})` : ""}
                    {el.categoria === "infissi" ? `Infisso ${el.tipologia} - Vetro ${el.tipo_vetro}` : ""}
                    {el.categoria !== "termico" && el.categoria !== "infissi" ? el.label : ""}
                  </p>
                  <p className="font-bold mt-2 uppercase">
                    <span className="text-black bg-green-500 px-2 py-1 mr-3">{el.categoria}</span>
                    {el.categoria === "termico" && el.sotto_categoria === "radiatore" ? `N. ${el.numero_elementi} EL. | ${el.carico_totale_w} W` : ""}
                    {el.categoria === "termico" && el.sotto_categoria === "split" ? `${el.carico_totale_w} W` : ""}
                    {el.categoria === "infissi" ? `Q.TA: ${el.quantita}` : ""}
                    {el.categoria !== "termico" && el.categoria !== "infissi" ? `Q.TA: ${el.quantita} | ${el.carico_totale_w} W` : ""}
                  </p>
                  {el.note && <p className="font-bold text-sm uppercase mt-2 opacity-70">NOTE: {el.note}</p>}
                </div>
                <div className="flex mt-4 sm:mt-0 border-t-2 border-dashed sm:border-0 border-white pt-2 sm:pt-0">
                  <button onClick={() => impostaModifica(el)} className="p-2 text-white hover:text-green-500 px-4">
                    <PenLine size={24} />
                  </button>
                  <button onClick={() => handleRimuoviElemento(el.id_istanza)} className="p-2 text-white hover:text-red-500 px-4">
                    <Trash2 size={24} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
