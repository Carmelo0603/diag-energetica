import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { NORMATIVA_LUX } from '../data/normativa_lux';
import { ArrowLeft, DoorOpen, Plus, Zap, Trash2, Home, Edit2, Flame } from 'lucide-react';

const PIANI_STANDARD = ['-2', '-1', 'TERRA', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

export default function DettaglioEdificio() {
  const { idEdificio } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('stanze');

  const [pianoStanza, setPianoStanza] = useState('');
  const [customPiano, setCustomPiano] = useState('');
  const [destinazioneId, setDestinazioneId] = useState('');
  const [nomeLibero, setNomeLibero] = useState('');
  const [customLux, setCustomLux] = useState('');
  const [superficieMq, setSuperficieMq] = useState('');
  const [stanzaInModifica, setStanzaInModifica] = useState(null);

  const [erroreNome, setErroreNome] = useState('');
  const [ordinamento, setOrdinamento] = useState('data_desc');

  const [nuovoPod, setNuovoPod] = useState('');
  const [codicePdr, setCodicePdr] = useState('');

  const [proprietario, setProprietario] = useState('');
  const [pianoUnita, setPianoUnita] = useState('');
  const [foglio, setFoglio] = useState('');
  const [particella, setParticella] = useState('');
  const [subalterno, setSubalterno] = useState('');
  const [idUnitaSelezionata, setIdUnitaSelezionata] = useState('');

  const [generatoreInModifica, setGeneratoreInModifica] = useState(null);
  const [tipoGeneratore, setTipoGeneratore] = useState('caldaia');
  const [vettoreEnergetico, setVettoreEnergetico] = useState('');
  const [marcaGeneratore, setMarcaGeneratore] = useState('');
  const [kwGeneratore, setKwGeneratore] = useState('');
  const [quantitaGeneratore, setQuantitaGeneratore] = useState("");

  const edificio = useLiveQuery(() => db.edifici.get(idEdificio));

  const ambientiRaw = useLiveQuery(() => db.ambienti.where('id_edificio').equals(idEdificio).toArray(), [idEdificio]);
  const ambienti = [...(ambientiRaw || [])].filter(a => !a._deleted).sort((a, b) => {
    const timeA = a.last_modified ? new Date(a.last_modified).getTime() : 0;
    const timeB = b.last_modified ? new Date(b.last_modified).getTime() : 0;
    if (ordinamento === 'data_desc') return timeB - timeA;
    if (ordinamento === 'data_asc') return timeA - timeB;
    if (ordinamento === 'alfa_asc') return (a.nome || '').localeCompare(b.nome || '');
    if (ordinamento === 'alfa_desc') return (b.nome || '').localeCompare(a.nome || '');
    return 0;
  });

  if (!edificio) return null;

  const datiNormativa = NORMATIVA_LUX[edificio.tipologia];
  const isResidenziale = datiNormativa?.isResidenziale;
  const isCustom = destinazioneId === 'custom';
  const isCondominio = edificio.macro_categoria === 'condominio';
  const isCustomPiano = pianoStanza === 'custom';

  const unitaList = edificio.unita_immobiliari || [];
  const generatoriList = edificio.generatori_calore || [];

  const handleAggiornaContatori = async (e) => {
    e.preventDefault();
    const arrayPods = edificio.pods ? [...edificio.pods] : [];
    if (nuovoPod.trim()) {
      arrayPods.push(nuovoPod.trim().toUpperCase());
    }
    await db.edifici.update(idEdificio, {
      pods: arrayPods,
      pdr: codicePdr.trim().toUpperCase(),
      is_synced: 0,
      last_modified: new Date().toISOString()
    });
    setNuovoPod('');
  };

  const handleRimuoviPod = async (index) => {
    const arrayPods = [...edificio.pods];
    arrayPods.splice(index, 1);
    await db.edifici.update(idEdificio, {
      pods: arrayPods,
      is_synced: 0,
      last_modified: new Date().toISOString()
    });
  };

  const handleCreaOAggiornaAmbiente = async (e) => {
    e.preventDefault();
    if (!destinazioneId || !pianoStanza) return;

    let unitaLabel = '';
    if (isCondominio && !isResidenziale && idUnitaSelezionata) {
      const u = unitaList.find(x => x.id_unita === idUnitaSelezionata);
      if (u) unitaLabel = `Sub. ${u.subalterno} - ${u.proprietario}`;
    }

    let nomeFinale = '';
    let targetLux = 0;
    const pianoFinale = isCustomPiano ? customPiano.trim().toUpperCase() : pianoStanza;

    const finalMq = superficieMq ? parseFloat(superficieMq) : null;

    if (isCustom) {
      if (!nomeLibero || !customLux) return;
      nomeFinale = unitaLabel ? `${nomeLibero} (${unitaLabel})` : nomeLibero;
      targetLux = parseInt(customLux, 10);
    } else {
      const targetOpt = datiNormativa.ambienti.find(d => d.id === destinazioneId);
      targetLux = targetOpt.lux_normativi;
      if (isResidenziale) {
        nomeFinale = targetOpt.label;
      } else {
        if (!nomeLibero) return;
        nomeFinale = unitaLabel ? `${nomeLibero} (${unitaLabel})` : nomeLibero;
      }
    }

    const checkDuplicato = ambienti.find(a =>
        a.nome.trim().toLowerCase() === nomeFinale.trim().toLowerCase() &&
        a.id !== stanzaInModifica?.id
    );

    if (checkDuplicato) {
      setErroreNome(`ERRORE: Esiste già un ambiente chiamato "${nomeFinale}". Sii più specifico per evitare duplicati.`);
      return;
    }

    setErroreNome('');

    if (stanzaInModifica) {
      await db.ambienti.update(stanzaInModifica.id, {
        nome: nomeFinale,
        piano: pianoFinale,
        mq: finalMq,
        destinazione_uso_id: destinazioneId,
        lux_normativi: targetLux,
        id_unita: isCondominio && !isResidenziale ? idUnitaSelezionata : '',
        is_synced: 0,
        last_modified: new Date().toISOString()
      });
      setStanzaInModifica(null);
      setDestinazioneId(''); setNomeLibero(''); setCustomLux(''); setSuperficieMq(''); setIdUnitaSelezionata(''); setPianoStanza(''); setCustomPiano('');
    } else {
      const newAmbienteId = `amb_${crypto.randomUUID()}`;
      await db.ambienti.add({
        id: newAmbienteId,
        id_edificio: idEdificio,
        nome: nomeFinale,
        piano: pianoFinale,
        mq: finalMq,
        id_unita: isCondominio && !isResidenziale ? idUnitaSelezionata : '',
        destinazione_uso_id: destinazioneId,
        lux_normativi: targetLux,
        elementi_inseriti: [],
        is_synced: 0,
        last_modified: new Date().toISOString()
      });
      navigate(`/ambiente/${newAmbienteId}`);
    }
  };

  const caricaModificaStanza = (e, amb) => {
    e.preventDefault();
    setStanzaInModifica(amb);
    setPianoStanza(PIANI_STANDARD.includes(amb.piano) ? amb.piano : 'custom');
    setCustomPiano(PIANI_STANDARD.includes(amb.piano) ? '' : (amb.piano || ''));
    setDestinazioneId(amb.destinazione_uso_id);
    setSuperficieMq(amb.mq ? amb.mq.toString() : '');
    setIdUnitaSelezionata(amb.id_unita || '');
    setErroreNome('');

    const rawNome = amb.nome ? amb.nome.split(' (Sub.')[0].trim() : '';
    setNomeLibero(rawNome);

    if (amb.destinazione_uso_id === 'custom') {
      setCustomLux(amb.lux_normativi.toString());
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRimuoviAmbiente = async (e, idAmbiente) => {
    e.preventDefault();
    if (window.confirm("Eliminare questa stanza e tutto il suo inventario?")) {
      await db.ambienti.update(idAmbiente, {
        _deleted: true,
        is_synced: 0,
        last_modified: new Date().toISOString()
      });
    }
  };

  const handleAggiungiUnita = async (e) => {
    e.preventDefault();
    if (!proprietario || !subalterno) return;
    const nuovaUnita = { id_unita: `u_${crypto.randomUUID()}`, proprietario, piano: pianoUnita, foglio, particella, subalterno };
    const arrayUnita = [...unitaList, nuovaUnita];
    await db.edifici.update(idEdificio, { unita_immobiliari: arrayUnita, is_synced: 0, last_modified: new Date().toISOString() });
    setProprietario(''); setPianoUnita(''); setFoglio(''); setParticella(''); setSubalterno('');
  };

  const handleRimuoviUnita = async (idUnita) => {
    const arrayUnita = unitaList.filter(u => u.id_unita !== idUnita);
    await db.edifici.update(idEdificio, { unita_immobiliari: arrayUnita, is_synced: 0, last_modified: new Date().toISOString() });
    if (idUnitaSelezionata === idUnita) setIdUnitaSelezionata('');
  };

  const handleCreaOAggiornaGeneratore = async (e) => {
    e.preventDefault();
    if (!vettoreEnergetico || !marcaGeneratore || !kwGeneratore || !quantitaGeneratore) return;

    const kw = parseFloat(kwGeneratore);
    const q = parseInt(quantitaGeneratore, 10);
    const totale_kw = Number((kw * q).toFixed(2));

    if (generatoreInModifica) {
      const arrayGenAggiornato = generatoriList.map(g =>
          g.id_generatore === generatoreInModifica.id_generatore
              ? { ...g, tipo: tipoGeneratore, vettore: vettoreEnergetico, marca: marcaGeneratore, kw, quantita: q, totale_kw }
              : g
      );
      await db.edifici.update(idEdificio, { generatori_calore: arrayGenAggiornato, is_synced: 0, last_modified: new Date().toISOString() });
      setGeneratoreInModifica(null);
    } else {
      const nuovoGen = {
        id_generatore: `gen_${crypto.randomUUID()}`,
        tipo: tipoGeneratore,
        vettore: vettoreEnergetico,
        marca: marcaGeneratore,
        kw: kw,
        quantita: q,
        totale_kw: totale_kw
      };
      const arrayGen = [...generatoriList, nuovoGen];
      await db.edifici.update(idEdificio, { generatori_calore: arrayGen, is_synced: 0, last_modified: new Date().toISOString() });
    }

    setTipoGeneratore('caldaia');
    setVettoreEnergetico('');
    setMarcaGeneratore('');
    setKwGeneratore('');
    setQuantitaGeneratore("");
  };

  const caricaModificaGeneratore = (e, gen) => {
    e.preventDefault();
    setGeneratoreInModifica(gen);
    setTipoGeneratore(gen.tipo);
    setVettoreEnergetico(gen.vettore);
    setMarcaGeneratore(gen.marca);
    setKwGeneratore(gen.kw.toString());
    setQuantitaGeneratore(gen.quantita.toString());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const annullaModificaGeneratore = () => {
    setGeneratoreInModifica(null);
    setTipoGeneratore('caldaia');
    setVettoreEnergetico('');
    setMarcaGeneratore('');
    setKwGeneratore('');
    setQuantitaGeneratore("");
  };

  const handleRimuoviGeneratore = async (idGen) => {
    const arrayGen = generatoriList.filter(g => g.id_generatore !== idGen);
    await db.edifici.update(idEdificio, { generatori_calore: arrayGen, is_synced: 0, last_modified: new Date().toISOString() });
  };

  return (
      <div className="space-y-8">

        <div className="border-4 border-white p-6">
          <Link to="/" className="inline-flex items-center font-bold text-white hover:text-green-500 mb-4 uppercase transition-none">
            <ArrowLeft size={20} className="mr-2" /> Archivio
          </Link>
          <div className="flex flex-col md:flex-row justify-between md:items-center">
            <div>
              <h2 className="text-4xl font-black tracking-tighter uppercase">{edificio.nome}</h2>
              <span className="inline-block mt-2 font-bold text-green-500 uppercase">
                  {datiNormativa?.label || edificio.tipologia}
                  </span>
            </div>
          </div>
          {edificio.note && <div className="mt-4 border-l-4 border-green-500 pl-4 py-2 font-bold text-zinc-300 uppercase text-sm">NOTE: {edificio.note}</div>}
        </div>

        <section className="border-4 border-white p-6">
          <h3 className="text-xl font-black uppercase tracking-tighter mb-6 flex items-center gap-2">
            <Zap size={24} className="text-green-500" /> Forniture Energetiche
          </h3>
          <form onSubmit={handleAggiornaContatori} className="space-y-4 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase mb-2">POD Elettrico</label>
                <input type="text" placeholder="IT001E..." value={nuovoPod} onChange={(e) => setNuovoPod(e.target.value)} className="w-full bg-black border-2 border-white p-4 font-mono text-white uppercase focus:border-green-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase mb-2">PDR Gas</label>
                <input type="text" placeholder="ES. 001000..." value={codicePdr} onChange={(e) => setCodicePdr(e.target.value)} className="w-full bg-black border-2 border-white p-4 font-mono text-white uppercase focus:border-green-500 outline-none" />
              </div>
            </div>
            <button type="submit" className="bg-white text-black font-black px-6 py-3 uppercase hover:bg-green-500 w-full transition-none">Salva Dati Forniture</button>
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t-2 border-white">
            <div>
              <span className="block text-sm font-bold uppercase text-zinc-400 mb-2">POD registrati:</span>
              {edificio.pods && edificio.pods.length > 0 ? (
                  edificio.pods.map((pod, idx) => (
                      <div key={idx} className="border-2 border-white p-2 flex justify-between items-center font-mono text-sm mb-2">
                        {pod} <button onClick={() => handleRimuoviPod(idx)} className="text-red-500 text-xs font-bold hover:text-white uppercase transition-none">Rimuovi</button>
                      </div>
                  ))
              ) : <span className="text-xs font-mono uppercase text-zinc-600">Nessun POD inserito</span>}
            </div>
            <div>
              <span className="block text-sm font-bold uppercase text-zinc-400 mb-2">PDR Gas Attivo:</span>
              {edificio.pdr ? (
                  <div className="border-2 border-green-500 p-2 font-mono text-sm text-green-500">
                    {edificio.pdr}
                  </div>
              ) : <span className="text-xs font-mono uppercase text-zinc-600">Nessun PDR inserito</span>}
            </div>
          </div>
        </section>

        {isCondominio && (
            <section className="border-4 border-white p-6">
              <h3 className="text-xl font-black uppercase tracking-tighter mb-6 flex items-center gap-2"><Home size={24} className="text-green-500" /> Unità Immobiliari</h3>
              <form onSubmit={handleAggiungiUnita} className="space-y-4 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="md:col-span-2"><label className="block text-sm font-bold uppercase mb-2">Proprietario</label><input type="text" required value={proprietario} onChange={(e) => setProprietario(e.target.value)} className="w-full bg-black border-2 border-white p-4 text-white uppercase focus:border-green-500 outline-none" /></div>
                  <div><label className="block text-sm font-bold uppercase mb-2">Piano</label><input type="text" value={pianoUnita} onChange={(e) => setPianoUnita(e.target.value)} className="w-full bg-black border-2 border-white p-4 text-white uppercase focus:border-green-500 outline-none" /></div>
                  <div><label className="block text-sm font-bold uppercase mb-2">Fg/Part.</label><div className="flex gap-2"><input type="text" placeholder="FG" value={foglio} onChange={(e) => setFoglio(e.target.value)} className="w-1/2 bg-black border-2 border-white p-4 text-white uppercase focus:border-green-500 outline-none" /><input type="text" placeholder="PART" value={particella} onChange={(e) => setParticella(e.target.value)} className="w-1/2 bg-black border-2 border-white p-4 text-white uppercase focus:border-green-500 outline-none" /></div></div>
                  <div><label className="block text-sm font-bold uppercase mb-2">Sub.</label><input type="text" required value={subalterno} onChange={(e) => setSubalterno(e.target.value)} className="w-full bg-black border-2 border-white p-4 text-white uppercase focus:border-green-500 outline-none" /></div>
                </div>
                <button type="submit" className="w-full bg-white text-black font-black py-4 uppercase hover:bg-green-500 border-2 border-white transition-none">Registra Unità</button>
              </form>
              {unitaList.length > 0 && (
                  <div className="space-y-2">
                    {unitaList.map((u) => (
                        <div key={u.id_unita} className="border-2 border-white p-4 flex justify-between items-center"><div className="flex flex-col sm:flex-row sm:items-center gap-2"><span className="font-black text-xl uppercase">{u.proprietario}</span><span className="text-green-500 font-bold uppercase">SUB. {u.subalterno} | PIANO {u.piano}</span></div><button onClick={() => handleRimuoviUnita(u.id_unita)} className="text-white hover:text-red-500"><Trash2 size={24}/></button></div>
                    ))}
                  </div>
              )}
            </section>
        )}

        <div className="flex border-4 border-white">
          <button
              onClick={() => setActiveTab('stanze')}
              className={`flex-1 py-4 font-black text-sm sm:text-xl uppercase transition-none flex items-center justify-center gap-2 ${activeTab === 'stanze' ? 'bg-white text-black' : 'bg-black text-white hover:bg-green-500 hover:text-black'}`}
          >
            <DoorOpen size={24} /> Stanze
          </button>
          <button
              onClick={() => setActiveTab('generatori')}
              className={`flex-1 py-4 font-black text-sm sm:text-xl uppercase transition-none border-l-4 border-white flex items-center justify-center gap-2 ${activeTab === 'generatori' ? 'bg-white text-black' : 'bg-black text-white hover:bg-green-500 hover:text-black'}`}
          >
            <Flame size={24} /> Impianti
          </button>
        </div>

        {activeTab === 'stanze' && (
            <div className="space-y-8">
              <section className="border-4 border-white p-6">
                <h3 className="text-xl font-black uppercase tracking-tighter mb-6 flex items-center gap-2">
                  <Plus size={24} className="text-green-500" /> {stanzaInModifica ? 'Modifica Stanza' : 'Nuova Stanza'}
                </h3>

                <form onSubmit={handleCreaOAggiornaAmbiente} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="md:col-span-1">
                      <label className="block text-sm font-bold uppercase mb-2">Piano</label>
                      <select required value={pianoStanza} onChange={(e) => { setPianoStanza(e.target.value); setCustomPiano(''); setErroreNome(''); }} className="w-full bg-black border-2 border-white p-4 focus:outline-none focus:border-green-500 focus:bg-green-500 focus:text-black text-white uppercase appearance-none rounded-none">
                        <option value="">-- SELEZIONA --</option>
                        {PIANI_STANDARD.map(p => <option key={p} value={p}>{p === 'TERRA' ? 'PIANO TERRA' : `PIANO ${p}`}</option>)}
                        <option disabled>──────────</option>
                        <option value="custom">+ AGGIUNGI PIANO</option>
                      </select>
                    </div>

                    {isCustomPiano && (
                        <div className="md:col-span-1">
                          <label className="block text-sm font-bold uppercase text-green-500 mb-2">Specifica Piano</label>
                          <input type="text" required value={customPiano} onChange={(e) => {setCustomPiano(e.target.value); setErroreNome('');}} className="w-full bg-black border-2 border-white p-4 focus:outline-none focus:border-green-500 focus:bg-green-500 focus:text-black text-white uppercase" />
                        </div>
                    )}

                    <div className="md:col-span-1">
                      <label className="block text-sm font-bold uppercase mb-2">Superficie (MQ) - <span className="opacity-50 text-xs">Opzionale</span></label>
                      <input type="number" step="0.01" value={superficieMq} onChange={(e) => setSuperficieMq(e.target.value)} className="w-full bg-black border-2 border-white p-4 focus:outline-none focus:border-green-500 focus:bg-green-500 focus:text-black text-white uppercase" />
                    </div>

                    <div className={`md:col-span-${isCustomPiano ? '1' : '2'}`}>
                      <label className="block text-sm font-bold uppercase mb-2">Destinazione</label>
                      <select required value={destinazioneId} onChange={(e) => { setDestinazioneId(e.target.value); setNomeLibero(''); setErroreNome(''); }} className="w-full bg-black border-2 border-white p-4 focus:outline-none focus:border-green-500 focus:bg-green-500 focus:text-black text-white uppercase appearance-none rounded-none">
                        <option value="">-- SELEZIONA --</option>
                        {datiNormativa?.ambienti.map(opt => <option key={opt.id} value={opt.id}>{opt.label} ({opt.lux_normativi} LX)</option>)}
                        <option disabled>──────────</option>
                        <option value="custom">ALTRO (MANUALE)</option>
                      </select>
                    </div>
                  </div>

                  {destinazioneId && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 border-4 border-green-500">
                        {(!isResidenziale || isCustom) && (
                            <div className="md:col-span-2">
                              <label className="block text-sm font-bold uppercase text-green-500 mb-2">Nome Stanza</label>
                              <input type="text" required placeholder={isCustom ? "ES. SGABUZZINO" : "ES. SEGRETERIA"} value={nomeLibero} onChange={(e) => {setNomeLibero(e.target.value); setErroreNome('');}} className="w-full bg-black border-2 border-white p-4 focus:outline-none focus:border-green-500 focus:bg-green-500 focus:text-black text-white uppercase" />
                            </div>
                        )}
                        {isCustom && (
                            <div className="md:col-span-1">
                              <label className="block text-sm font-bold uppercase text-green-500 mb-2">Target LUX</label>
                              <input type="number" required placeholder="100" value={customLux} onChange={(e) => setCustomLux(e.target.value)} className="w-full bg-black border-2 border-white p-4 focus:outline-none focus:border-green-500 focus:bg-green-500 focus:text-black text-white uppercase" />
                            </div>
                        )}
                      </div>
                  )}

                  {erroreNome && (
                      <div className="bg-red-500 text-white font-black p-4 uppercase text-sm border-2 border-white">
                        {erroreNome}
                      </div>
                  )}

                  <div className="flex gap-4">
                    <button type="submit" className="flex-1 bg-white text-black font-black text-xl py-4 uppercase border-2 border-white hover:bg-green-500 transition-none">{stanzaInModifica ? 'Aggiorna Stanza' : 'Crea Ambiente'}</button>
                    {stanzaInModifica && <button type="button" onClick={() => { setStanzaInModifica(null); setDestinazioneId(''); setSuperficieMq(''); setPianoStanza(''); setCustomPiano(''); setErroreNome(''); setNomeLibero(''); }} className="bg-black text-white border-4 border-white px-6 font-black uppercase text-sm hover:border-red-500 hover:text-red-500 transition-none">Annulla</button>}
                  </div>
                </form>
              </section>

              <section>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2 mb-4">
                      <DoorOpen size={24} className="text-green-500" /> Elenco Stanze
                    </h3>
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
                  <div className="text-right">
                    <span className="text-xs sm:text-sm font-bold uppercase text-zinc-400 block mb-1">Totale Registrate</span>
                    <span className="text-3xl sm:text-4xl font-black text-green-500 leading-none">{ambienti?.length || 0}</span>
                  </div>
                </div>

                {ambienti?.length === 0 ? (
                    <p className="font-bold uppercase p-6 border-2 border-dashed border-zinc-700 text-center text-zinc-500">Nessuna stanza censita in questo fabbricato.</p>
                ) : (
                    <div className="grid gap-4">
                      {ambienti?.map(ambiente => (
                          <div key={ambiente.id} className={`border-2 border-white p-6 flex flex-col sm:flex-row justify-between sm:items-center transition-none group gap-4 ${stanzaInModifica?.id === ambiente.id ? 'border-green-500 bg-green-950' : 'hover:border-green-500'}`}>
                            <Link to={`/ambiente/${ambiente.id}`} className="flex-1 block">
                              <h4 className="text-2xl font-black uppercase group-hover:text-green-500">{ambiente.nome}</h4>
                              <p className="font-bold mt-2 uppercase opacity-80 text-zinc-400">
                                PIANO: {ambiente.piano} | {ambiente.mq ? Number(ambiente.mq).toFixed(2).replace('.', ',') : "NON SPECIFICATO"} MQ | TARGET: {ambiente.lux_normativi} LUX | ASSET: {ambiente.elementi_inseriti?.length || 0}
                              </p>
                            </Link>
                            <div className="flex items-center gap-2 justify-end border-t-2 border-dashed sm:border-0 border-zinc-800 pt-3 sm:pt-0">
                              <button onClick={(e) => caricaModificaStanza(e, ambiente)} className="text-white hover:text-green-500 p-2 border border-white transition-none"><Edit2 size={20}/></button>
                              <button onClick={(e) => handleRimuoviAmbiente(e, ambiente.id)} className="text-white hover:text-red-500 p-2 border border-white hover:border-red-500 transition-none"><Trash2 size={20} /></button>
                              <Link to={`/ambiente/${ambiente.id}`} className="font-black text-sm bg-white text-black px-4 py-2 uppercase hover:bg-green-500 border-2 border-white hover:border-green-50 transition-none">Apri</Link>
                            </div>
                          </div>
                      ))}
                    </div>
                )}
              </section>
            </div>
        )}

        {activeTab === 'generatori' && (
            <div className="space-y-8">
              <section className="border-4 border-white p-6">
                <h3 className="text-xl font-black uppercase tracking-tighter mb-6 flex items-center gap-2">
                  <Flame size={24} className="text-green-500" /> {generatoreInModifica ? 'Modifica Generatore' : 'Nuovo Generatore Centralizzato'}
                </h3>
                <form onSubmit={handleCreaOAggiornaGeneratore} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                      <label className="block text-sm font-bold uppercase mb-2">Tipologia</label>
                      <select value={tipoGeneratore} onChange={e => setTipoGeneratore(e.target.value)} className="w-full bg-black border-2 border-white p-4 text-white uppercase focus:border-green-500 outline-none appearance-none rounded-none">
                        <option value="caldaia">CALDAIA</option>
                        <option value="pompa_calore">POMPA DI CALORE</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold uppercase mb-2">Vettore Energ.</label>
                      <input type="text" placeholder="ES. METANO" required value={vettoreEnergetico} onChange={e => setVettoreEnergetico(e.target.value)} className="w-full bg-black border-2 border-white p-4 text-white uppercase focus:border-green-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold uppercase mb-2">Marca / Mod.</label>
                      <input type="text" required value={marcaGeneratore} onChange={e => setMarcaGeneratore(e.target.value)} className="w-full bg-black border-2 border-white p-4 text-white uppercase focus:border-green-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold uppercase mb-2">Potenza (kW)</label>
                      <input type="number" step="0.01" required value={kwGeneratore} onChange={e => setKwGeneratore(e.target.value)} className="w-full bg-black border-2 border-white p-4 text-white uppercase focus:border-green-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold uppercase mb-2">Quantità</label>
                      <input type="number" min="1" placeholder="ES. 1" required value={quantitaGeneratore} onChange={e => setQuantitaGeneratore(e.target.value)} className="w-full bg-black border-2 border-white p-4 text-white uppercase focus:border-green-500 outline-none" />
                    </div>
                  </div>
                  <div className="flex gap-4 pt-4">
                    <button type="submit" className="flex-1 bg-white text-black font-black py-4 uppercase hover:bg-green-500 border-2 border-white transition-none">
                      {generatoreInModifica ? 'Aggiorna Generatore' : 'Registra Generatore'}
                    </button>
                    {generatoreInModifica && (
                        <button type="button" onClick={annullaModificaGeneratore} className="flex-1 bg-black text-white font-black py-4 uppercase border-4 border-white hover:border-red-500 hover:text-red-500 transition-none">
                          Annulla
                        </button>
                    )}
                  </div>
                </form>
              </section>

              <section>
                <div className="flex justify-between items-end mb-6">
                  <h3 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
                    <Flame size={24} className="text-green-500" /> Elenco Impianti
                  </h3>
                  <div className="text-right">
                    <span className="text-xs sm:text-sm font-bold uppercase text-zinc-400 block mb-1">Totale Registrati</span>
                    <span className="text-3xl sm:text-4xl font-black text-green-500 leading-none">{generatoriList.length}</span>
                  </div>
                </div>
                {generatoriList.length === 0 ? (
                    <p className="font-bold uppercase p-6 border-2 border-dashed border-zinc-700 text-center text-zinc-500">Nessun generatore censito in questo fabbricato.</p>
                ) : (
                    <div className="space-y-4">
                      {[...generatoriList].reverse().map((g) => (
                          <div key={g.id_generatore} className={`border-2 p-6 flex flex-col sm:flex-row justify-between sm:items-center transition-none group gap-4 ${generatoreInModifica?.id_generatore === g.id_generatore ? 'border-green-500 bg-green-950' : 'border-white hover:border-green-500'}`}>
                            <div>
                              <span className="font-black text-2xl uppercase text-green-500 block mb-2">{g.tipo.replace('_', ' ')}</span>
                              <span className="font-black text-xl uppercase block">{g.marca}</span>
                              <span className="font-bold uppercase opacity-80 text-zinc-400 block mt-2">
                                {g.kw} kW | VETTORE: {g.vettore} | Q.TÀ: {g.quantita} | TOT: {g.totale_kw || Number((g.kw * g.quantita).toFixed(2))} kW
                            </span>
                            </div>
                            <div className="flex items-center gap-2 justify-end border-t-2 border-dashed sm:border-0 border-zinc-800 pt-3 sm:pt-0">
                              <button onClick={(e) => caricaModificaGeneratore(e, g)} className="text-white hover:text-green-500 p-2 border border-white transition-none"><Edit2 size={20}/></button>
                              <button onClick={() => handleRimuoviGeneratore(g.id_generatore)} className="text-white hover:text-red-500 p-2 border border-white hover:border-red-500 transition-none">
                                <Trash2 size={20} />
                              </button>
                            </div>
                          </div>
                      ))}
                    </div>
                )}
              </section>
            </div>
        )}

      </div>
  );
}