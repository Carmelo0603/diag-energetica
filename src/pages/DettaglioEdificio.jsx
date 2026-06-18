import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/database";
import { NORMATIVA_LUX } from "../data/normativa_lux";
import { ArrowLeft, DoorOpen, Plus, Zap, Trash2, Download, Home } from "lucide-react";
import { esportaRilievoExcel } from "../utils/exportExcel";

export default function DettaglioEdificio() {
  const { idEdificio } = useParams();

  const [destinazioneId, setDestinazioneId] = useState("");
  const [nomeLibero, setNomeLibero] = useState("");
  const [customLux, setCustomLux] = useState("");
  const [tipoExport, setTipoExport] = useState("tutto");
  const [nuovoPod, setNuovoPod] = useState("");
  const [proprietario, setProprietario] = useState("");
  const [piano, setPiano] = useState("");
  const [foglio, setFoglio] = useState("");
  const [particella, setParticella] = useState("");
  const [subalterno, setSubalterno] = useState("");
  const [idUnitaSelezionata, setIdUnitaSelezionata] = useState("");

  const edificio = useLiveQuery(() => db.edifici.get(idEdificio));
  const ambienti = useLiveQuery(() => db.ambienti.where("id_edificio").equals(idEdificio).reverse().toArray());

  if (!edificio) return null;

  const datiNormativa = NORMATIVA_LUX[edificio.tipologia];
  const isResidenziale = datiNormativa?.isResidenziale;
  const isCustom = destinazioneId === "custom";
  const isCondominio = edificio.macro_categoria === "condominio";
  const unitaList = edificio.unita_immobiliari || [];

  const handleAggiungiPod = async (e) => {
    e.preventDefault();
    if (!nuovoPod.trim()) return;
    const arrayPods = edificio.pods ? [...edificio.pods] : [];
    arrayPods.push(nuovoPod.trim().toUpperCase());
    await db.edifici.update(idEdificio, { pods: arrayPods });
    setNuovoPod("");
  };

  const handleRimuoviPod = async (index) => {
    const arrayPods = [...edificio.pods];
    arrayPods.splice(index, 1);
    await db.edifici.update(idEdificio, { pods: arrayPods });
  };

  const handleAggiungiUnita = async (e) => {
    e.preventDefault();
    if (!proprietario || !subalterno) return;
    const nuovaUnita = {
      id_unita: `u_${crypto.randomUUID()}`,
      proprietario,
      piano,
      foglio,
      particella,
      subalterno,
    };
    const arrayUnita = [...unitaList, nuovaUnita];
    await db.edifici.update(idEdificio, { unita_immobiliari: arrayUnita });
    setProprietario("");
    setPiano("");
    setFoglio("");
    setParticella("");
    setSubalterno("");
  };

  const handleRimuoviUnita = async (idUnita) => {
    const arrayUnita = unitaList.filter((u) => u.id_unita !== idUnita);
    await db.edifici.update(idEdificio, { unita_immobiliari: arrayUnita });
    if (idUnitaSelezionata === idUnita) setIdUnitaSelezionata("");
  };

  const handleCreaAmbiente = async (e) => {
    e.preventDefault();
    if (!destinazioneId) return;
    let unitaLabel = "";
    if (isCondominio && !isResidenziale && idUnitaSelezionata) {
      const u = unitaList.find((x) => x.id_unita === idUnitaSelezionata);
      if (u) unitaLabel = `Sub. ${u.subalterno} - ${u.proprietario}`;
    }
    let nomeFinale = "";
    let targetLux = 0;
    if (isCustom) {
      if (!nomeLibero || !customLux) return;
      nomeFinale = unitaLabel ? `${nomeLibero} (${unitaLabel})` : nomeLibero;
      targetLux = parseInt(customLux, 10);
    } else {
      const targetOpt = datiNormativa.ambienti.find((d) => d.id === destinazioneId);
      targetLux = targetOpt.lux_normativi;
      if (isResidenziale) {
        nomeFinale = targetOpt.label;
      } else {
        if (!nomeLibero) return;
        nomeFinale = unitaLabel ? `${nomeLibero} (${unitaLabel})` : nomeLibero;
      }
    }
    await db.ambienti.add({
      id: `amb_${crypto.randomUUID()}`,
      id_edificio: idEdificio,
      nome: nomeFinale,
      id_unita: isCondominio && !isResidenziale ? idUnitaSelezionata : "",
      destinazione_uso_id: destinazioneId,
      lux_normativi: targetLux,
      elementi_inseriti: [],
    });
    setDestinazioneId("");
    setNomeLibero("");
    setCustomLux("");
  };

  return (
    <div className="space-y-12">
      <div className="border-4 border-white p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <Link to="/" className="inline-flex items-center font-bold text-white hover:text-green-500 mb-4 transition-none uppercase">
            <ArrowLeft size={20} className="mr-2" /> Indietro
          </Link>
          <h2 className="text-4xl font-black tracking-tighter uppercase">{edificio.nome}</h2>
          <span className="inline-block mt-2 font-bold text-green-500 uppercase">{datiNormativa?.label || edificio.tipologia}</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <select
            value={tipoExport}
            onChange={(e) => setTipoExport(e.target.value)}
            className="bg-black border-2 border-white text-white p-3 rounded-none outline-none focus:border-green-500 uppercase font-bold appearance-none"
          >
            <option value="tutto">TUTTO (3 FOGLI)</option>
            <option value="illuminazione">SOLO ILLUMINAZIONE</option>
            <option value="termico">SOLO TERMICO</option>
            <option value="apparecchi">SOLO APPARECCHIATURE</option>
          </select>
          <button
            onClick={() => esportaRilievoExcel(idEdificio, tipoExport)}
            className="bg-white text-black font-black uppercase px-6 py-3 border-2 border-white hover:bg-green-500 hover:border-green-500 flex items-center justify-center gap-2 transition-none"
          >
            <Download size={20} /> Esporta
          </button>
        </div>
      </div>

      <section className="border-4 border-white p-6">
        <h3 className="text-xl font-black uppercase tracking-tighter mb-6 flex items-center gap-2">
          <Zap size={24} className="text-green-500" /> POD Elettrici
        </h3>
        <form onSubmit={handleAggiungiPod} className="flex flex-col sm:flex-row gap-2 mb-6">
          <input
            type="text"
            placeholder="ES. IT001E..."
            value={nuovoPod}
            onChange={(e) => setNuovoPod(e.target.value)}
            className="flex-1 bg-black border-2 border-white p-4 focus:outline-none focus:border-green-500 focus:bg-green-500 focus:text-black text-white font-mono uppercase"
          />
          <button type="submit" className="bg-white text-black font-black px-8 py-4 uppercase hover:bg-green-500 transition-none">
            Aggiungi
          </button>
        </form>
        {edificio.pods && edificio.pods.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {edificio.pods.map((pod, idx) => (
              <div key={idx} className="border-2 border-white p-4 flex justify-between items-center font-mono font-bold text-lg">
                {pod}
                <button onClick={() => handleRimuoviPod(idx)} className="text-white hover:text-green-500">
                  <Trash2 size={24} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {isCondominio && (
        <section className="border-4 border-white p-6">
          <h3 className="text-xl font-black uppercase tracking-tighter mb-6 flex items-center gap-2">
            <Home size={24} className="text-green-500" /> Unità Immobiliari
          </h3>
          <form onSubmit={handleAggiungiUnita} className="space-y-4 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold uppercase mb-2">Proprietario</label>
                <input
                  type="text"
                  required
                  value={proprietario}
                  onChange={(e) => setProprietario(e.target.value)}
                  className="w-full bg-black border-2 border-white p-4 focus:outline-none focus:border-green-500 focus:bg-green-500 focus:text-black text-white uppercase"
                />
              </div>
              <div>
                <label className="block text-sm font-bold uppercase mb-2">Piano</label>
                <input
                  type="text"
                  value={piano}
                  onChange={(e) => setPiano(e.target.value)}
                  className="w-full bg-black border-2 border-white p-4 focus:outline-none focus:border-green-500 focus:bg-green-500 focus:text-black text-white uppercase"
                />
              </div>
              <div>
                <label className="block text-sm font-bold uppercase mb-2">Fg/Part.</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="FG"
                    value={foglio}
                    onChange={(e) => setFoglio(e.target.value)}
                    className="w-1/2 bg-black border-2 border-white p-4 focus:outline-none focus:border-green-500 focus:bg-green-500 focus:text-black text-white uppercase"
                  />
                  <input
                    type="text"
                    placeholder="PART"
                    value={particella}
                    onChange={(e) => setParticella(e.target.value)}
                    className="w-1/2 bg-black border-2 border-white p-4 focus:outline-none focus:border-green-500 focus:bg-green-500 focus:text-black text-white uppercase"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold uppercase mb-2">Sub.</label>
                <input
                  type="text"
                  required
                  value={subalterno}
                  onChange={(e) => setSubalterno(e.target.value)}
                  className="w-full bg-black border-2 border-white p-4 focus:outline-none focus:border-green-500 focus:bg-green-500 focus:text-black text-white uppercase"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-white text-black font-black py-4 uppercase hover:bg-green-500 transition-none border-2 border-white hover:border-green-500"
            >
              Registra Unità
            </button>
          </form>

          {unitaList.length > 0 && (
            <div className="space-y-4">
              {unitaList.map((u) => (
                <div key={u.id_unita} className="border-2 border-white p-4 flex justify-between items-center">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <span className="font-black text-xl uppercase">{u.proprietario}</span>
                    <span className="text-green-500 font-bold uppercase">
                      SUB. {u.subalterno} | PIANO {u.piano} | FG. {u.foglio} PART. {u.particella}
                    </span>
                  </div>
                  <button onClick={() => handleRimuoviUnita(u.id_unita)} className="text-white hover:text-green-500">
                    <Trash2 size={24} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      <section className="border-4 border-white p-6">
        <h3 className="text-xl font-black uppercase tracking-tighter mb-6 flex items-center gap-2">
          <Plus size={24} className="text-green-500" /> Nuova Stanza
        </h3>

        <form onSubmit={handleCreaAmbiente} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {isCondominio && !isResidenziale ? (
              <div>
                <label className="block text-sm font-bold uppercase mb-2">Unità di appartenenza</label>
                <select
                  required
                  value={idUnitaSelezionata}
                  onChange={(e) => setIdUnitaSelezionata(e.target.value)}
                  className="w-full bg-black border-2 border-white p-4 focus:outline-none focus:border-green-500 focus:bg-green-500 focus:text-black text-white uppercase appearance-none rounded-none"
                >
                  <option value="">-- SELEZIONA UNITA' --</option>
                  {unitaList.map((u) => (
                    <option key={u.id_unita} value={u.id_unita}>
                      SUB. {u.subalterno} - {u.proprietario}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="flex items-end font-bold text-green-500 uppercase p-4 border-2 border-dashed border-white">
                {isResidenziale ? "RILIEVO AREE COMUNI" : "PROPRIETA' SINGOLA"}
              </div>
            )}

            <div>
              <label className="block text-sm font-bold uppercase mb-2">Destinazione</label>
              <select
                required
                value={destinazioneId}
                onChange={(e) => {
                  setDestinazioneId(e.target.value);
                  setNomeLibero("");
                }}
                className="w-full bg-black border-2 border-white p-4 focus:outline-none focus:border-green-500 focus:bg-green-500 focus:text-black text-white uppercase appearance-none rounded-none"
              >
                <option value="">-- SELEZIONA --</option>
                {datiNormativa?.ambienti.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label} ({opt.lux_normativi} LX)
                  </option>
                ))}
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
                  <input
                    type="text"
                    required
                    placeholder={isCustom ? "ES. SGABUZZINO" : "ES. SEGRETERIA"}
                    value={nomeLibero}
                    onChange={(e) => setNomeLibero(e.target.value)}
                    className="w-full bg-black border-2 border-white p-4 focus:outline-none focus:border-green-500 focus:bg-green-500 focus:text-black text-white uppercase"
                  />
                </div>
              )}
              {isCustom && (
                <div className="md:col-span-1">
                  <label className="block text-sm font-bold uppercase text-green-500 mb-2">Target LUX</label>
                  <input
                    type="number"
                    required
                    placeholder="100"
                    value={customLux}
                    onChange={(e) => setCustomLux(e.target.value)}
                    className="w-full bg-black border-2 border-white p-4 focus:outline-none focus:border-green-500 focus:bg-green-500 focus:text-black text-white uppercase"
                  />
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-white text-black font-black text-xl py-4 uppercase border-2 border-white hover:bg-green-500 hover:border-green-500 transition-none"
          >
            Crea Ambiente
          </button>
        </form>
      </section>

      <section>
        <h3 className="text-xl font-black uppercase tracking-tighter mb-6 flex items-center gap-2">
          <DoorOpen size={24} className="text-green-500" /> Stanze
        </h3>
        <div className="grid gap-4">
          {ambienti?.map((ambiente) => (
            <Link
              key={ambiente.id}
              to={`/ambiente/${ambiente.id}`}
              className="border-2 border-white p-6 flex justify-between items-center hover:bg-green-500 hover:text-black hover:border-green-500 transition-none group"
            >
              <div>
                <h4 className="text-2xl font-black uppercase">{ambiente.nome}</h4>
                <p className="font-bold mt-2 uppercase opacity-80">
                  TARGET: {ambiente.lux_normativi} LUX | ELEMENTI: {ambiente.elementi_inseriti.length}
                </p>
              </div>
              <span className="font-black text-xl hidden sm:block">ENTRA</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
