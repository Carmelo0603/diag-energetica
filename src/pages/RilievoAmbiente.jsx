import { useState, useEffect } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { ArrowLeft, Trash2, Lightbulb, MonitorPlay, Thermometer, PenLine, Grid } from 'lucide-react';
import FormTermico from '../components/FormTermico';
import FormApparecchio from '../components/FormApparecchio';
import FormInfissi from '../components/FormInfissi';

const MAPPA_CATEGORIE = {
  'luci': 'illuminazione',
  'apparecchi': 'apparecchio',
  'termico': 'termico',
  'infissi': 'infissi'
};

const TAB_DA_CATEGORIA = {
  'illuminazione': 'luci',
  'apparecchio': 'apparecchi',
  'termico': 'termico',
  'infissi': 'infissi'
};

const MAPPA_TITOLI = {
  'luci': 'LUCI',
  'apparecchi': 'APPARECCHIATURE',
  'termico': 'TERMICO',
  'infissi': 'INFISSI'
};

const renderTermicoLabel = (el) => {
  switch(el.sotto_categoria) {
    case 'radiatore': return `${el.tipologia} (${el.altezza_label})`;
    case 'split': return el.label;
    case 'fancoil': return `Fancoil ${el.marca} ${el.modello}`;
    case 'canalizzato': return `Macchina Canalizzato`;
    case 'pavimento_radiante': return `Pavimento Radiante ${el.marca} ${el.modello}`;
    case 'soffitto_radiante': return `Soffitto Radiante ${el.marca} ${el.modello}`;
    default: return el.label || 'SISTEMA TERMICO';
  }
};

const renderTermicoStats = (el) => {
  switch(el.sotto_categoria) {
    case 'radiatore': return `N. ${el.numero_elementi} EL. | ${el.carico_totale_w} W`;
    case 'split': return `${el.carico_totale_w} W`;
    case 'fancoil': return `Q.TA: ${el.quantita} | RISC: ${el.potenza_risc}W | RAFF: ${el.potenza_raff}W`;
    case 'canalizzato': return `POTENZA MACCHINA: ${el.potenza_macchina}W`;
    case 'pavimento_radiante':
    case 'soffitto_radiante': return `SUP: ${el.superficie} MQ | PASSO POSA: ${el.passo_posa}`;
    default: return '';
  }
};

export default function RilievoAmbiente() {
  const { idAmbiente } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [tipoInserimento, setTipoInserimento] = useState('luci');
  const [elementoInModifica, setElementoInModifica] = useState(null);
  const [highlightedId, setHighlightedId] = useState(null);
  const [alertMessaggio, setAlertMessaggio] = useState(''); // Nuovo stato per il toast alert

  const ambiente = useLiveQuery(() => db.ambienti.get(idAmbiente));

  useEffect(() => {
    if (ambiente && location.state?.highlight) {
      const hId = location.state.highlight;
      const targetEl = ambiente.elementi_inseriti?.find(e => e.id_istanza === hId);

      if (targetEl) {
        setTipoInserimento(TAB_DA_CATEGORIA[targetEl.categoria] || 'luci');
        setHighlightedId(hId);
        setTimeout(() => {
          const elDom = document.getElementById(hId);
          if (elDom) elDom.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 150);
        setTimeout(() => setHighlightedId(null), 3000);
        navigate(location.pathname, { replace: true, state: {} });
      }
    }
  }, [location.state, ambiente, navigate, location.pathname]);

  if (!ambiente) return null;

  const elementi = ambiente.elementi_inseriti || [];

  // Aggiunto .reverse() per ordinare dal più recente al più vecchio
  const elementiFiltrati = elementi
      .filter(el => el.categoria === MAPPA_CATEGORIE[tipoInserimento])
      .reverse();

  const handleSalvaElemento = async (elementoCorrente) => {
    let elementiAggiornati;
    let isModifica = !!elementoInModifica;

    if (isModifica) {
      elementiAggiornati = elementi.map(el => el.id_istanza === elementoCorrente.id_istanza ? elementoCorrente : el);
      setElementoInModifica(null);
    } else {
      elementiAggiornati = [...elementi, elementoCorrente];
    }

    await db.ambienti.update(idAmbiente, { elementi_inseriti: elementiAggiornati });

    // Gestione Alert (Toast)
    setAlertMessaggio(isModifica ? "ELEMENTO AGGIORNATO" : "ELEMENTO REGISTRATO");
    setTimeout(() => setAlertMessaggio(''), 2000);
  };

  const handleRimuoviElemento = async (idIstanza) => {
    const elementiAggiornati = elementi.filter(el => el.id_istanza !== idIstanza);
    await db.ambienti.update(idAmbiente, { elementi_inseriti: elementiAggiornati });
  };

  const impostaModifica = (el) => {
    setElementoInModifica(el);
    setTipoInserimento(TAB_DA_CATEGORIA[el.categoria] || 'luci');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
      <div className="space-y-12 relative">

        {/* Toast Alert Fluttuante */}
        {alertMessaggio && (
            <div className="fixed bottom-8 right-8 bg-green-500 text-black px-6 py-4 font-black uppercase text-lg border-4 border-white shadow-[8px_8px_0_0_#fff] z-50 animate-bounce">
              {alertMessaggio}
            </div>
        )}

        <div className="border-4 border-white p-6">
          <Link to={`/edificio/${ambiente.id_edificio}`} className="inline-flex items-center font-bold text-white hover:text-green-500 mb-4 uppercase transition-none"><ArrowLeft size={20} className="mr-2" /> Fabbricato</Link>
          <div className="flex flex-col sm:flex-row justify-between items-start">
            <div>
              <h2 className="text-4xl font-black tracking-tighter uppercase">{ambiente.nome}</h2>
              <p className="font-bold text-green-500 mt-2 uppercase">PIANO: {ambiente.piano} | {ambiente.mq || "NON SPECIFICATO"} MQ | TARGET: {ambiente.lux_normativi} LUX</p>
            </div>
            <div className="mt-4 sm:mt-0 border-4 border-white p-4 text-center min-w-[120px]">
              <span className="block text-4xl font-black">{elementiFiltrati.length}</span>
              <span className="font-bold uppercase tracking-widest text-sm text-zinc-400">/ {elementi.length} Tot.</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-0 border-4 border-white">
          <button onClick={() => { setTipoInserimento('luci'); setElementoInModifica(null); }} className={`flex flex-col items-center justify-center py-6 font-black uppercase text-xs sm:text-sm border-r-2 border-white transition-none ${tipoInserimento === 'luci' ? 'bg-white text-black' : 'bg-black text-white hover:bg-green-500 hover:text-black'}`}><Lightbulb size={24} className="mb-2" /> Luci</button>
          <button onClick={() => { setTipoInserimento('apparecchi'); setElementoInModifica(null); }} className={`flex flex-col items-center justify-center py-6 font-black uppercase text-xs sm:text-sm border-r-2 border-white transition-none ${tipoInserimento === 'apparecchi' ? 'bg-white text-black' : 'bg-black text-white hover:bg-green-500 hover:text-black'}`}><MonitorPlay size={24} className="mb-2" /> Apparecchi</button>
          <button onClick={() => { setTipoInserimento('termico'); setElementoInModifica(null); }} className={`flex flex-col items-center justify-center py-6 font-black uppercase text-xs sm:text-sm border-r-2 border-white transition-none ${tipoInserimento === 'termico' ? 'bg-white text-black' : 'bg-black text-white hover:bg-green-500 hover:text-black'}`}><Thermometer size={24} className="mb-2" /> Termico</button>
          <button onClick={() => { setTipoInserimento('infissi'); setElementoInModifica(null); }} className={`flex flex-col items-center justify-center py-6 font-black uppercase text-xs sm:text-sm transition-none ${tipoInserimento === 'infissi' ? 'bg-white text-black' : 'bg-black text-white hover:bg-green-500 hover:text-black'}`}><Grid size={24} className="mb-2" /> Infissi</button>
        </div>

        <div className="border-4 border-white p-6">
          {tipoInserimento === 'termico' && (
              <FormTermico onSalva={handleSalvaElemento} initialData={elementoInModifica} onAnnulla={() => setElementoInModifica(null)} />
          )}
          {tipoInserimento === 'infissi' && (
              <FormInfissi onSalva={handleSalvaElemento} initialData={elementoInModifica} onAnnulla={() => setElementoInModifica(null)} />
          )}
          {(tipoInserimento === 'luci' || tipoInserimento === 'apparecchi') && (
              <FormApparecchio onSalva={handleSalvaElemento} tipoForm={tipoInserimento} initialData={elementoInModifica} onAnnulla={() => setElementoInModifica(null)} />
          )}
        </div>

        <div className="space-y-4 pb-12">
          <h3 className="text-xl font-black uppercase tracking-tighter mb-6">
            Inventario Stanza: <span className="text-green-500">{MAPPA_TITOLI[tipoInserimento]}</span>
          </h3>
          {elementiFiltrati.length === 0 ? <p className="font-bold uppercase p-6 border-2 border-dashed border-zinc-700 text-center text-zinc-500">Nessun asset censito in questa categoria.</p> : (
              <div className="grid gap-4">
                {elementiFiltrati.map(el => (
                    <div
                        key={el.id_istanza}
                        id={el.id_istanza}
                        className={`p-4 flex flex-col sm:flex-row justify-between sm:items-center transition-all duration-700 border-2 ${
                            highlightedId === el.id_istanza
                                ? 'bg-green-900 border-green-500 scale-[1.02] shadow-[0_0_20px_rgba(34,197,94,0.4)]'
                                : (elementoInModifica?.id_istanza === el.id_istanza ? 'bg-green-950 border-green-500' : 'border-white bg-black')
                        }`}
                    >
                      <div>
                        <p className="text-xl font-black uppercase">
                          {el.categoria === 'termico' ? renderTermicoLabel(el) : ''}
                          {el.categoria === 'infissi' ? `Infisso ${el.tipologia} - Vetro ${el.tipo_vetro}` : ''}
                          {el.categoria !== 'termico' && el.categoria !== 'infissi' ? el.label : ''}
                        </p>
                        <p className="font-bold mt-2 uppercase">
                          <span className="text-black bg-green-500 px-2 py-1 mr-3">{el.categoria}</span>
                          {el.categoria === 'termico' ? renderTermicoStats(el) : ''}
                          {el.categoria === 'infissi' ? `Q.TA: ${el.quantita}` : ''}
                          {el.categoria !== 'termico' && el.categoria !== 'infissi' ? `Q.TA: ${el.quantita} | ${el.carico_totale_w} W` : ''}
                        </p>
                        {el.note && <p className="font-bold text-sm uppercase mt-2 opacity-70">NOTE: {el.note}</p>}
                      </div>
                      <div className="flex mt-4 sm:mt-0 border-t-2 border-dashed sm:border-0 border-zinc-800 pt-3 sm:pt-0">
                        <button onClick={() => impostaModifica(el)} className="p-2 text-white hover:text-green-500 px-4 transition-none"><PenLine size={24} /></button>
                        <button onClick={() => handleRimuoviElemento(el.id_istanza)} className="p-2 text-white hover:text-red-500 px-4 transition-none"><Trash2 size={24} /></button>
                      </div>
                    </div>
                ))}
              </div>
          )}
        </div>
      </div>
  );
}