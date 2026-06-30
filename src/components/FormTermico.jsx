import { useState, useEffect } from "react";
import { DIZIONARIO_RADIATORI } from "../data/dizionario_radiatori";

export default function FormTermico({ onSalva, initialData = null, onAnnulla = null }) {
  const [tipoTermico, setTipoTermico] = useState("radiatore");

  // Dati Radiatore (Aggiornati al nuovo dizionario)
  const [materiale, setMateriale] = useState("");
  const [interasse, setInterasse] = useState("");
  const [numeroElementi, setNumeroElementi] = useState(1);

  // Dati Split
  const [splitLabel, setSplitLabel] = useState("");
  const [splitWatt, setSplitWatt] = useState("");
  const [quantitaSplit, setQuantitaSplit] = useState(1);

  // Dati Fancoil / Radiante
  const [marca, setMarca] = useState("");
  const [modello, setModello] = useState("");
  const [potenzaRisc, setPotenzaRisc] = useState("");
  const [potenzaRaff, setPotenzaRaff] = useState("");
  const [quantitaFancoil, setQuantitaFancoil] = useState(1);

  // Dati Canalizzato
  const [potenzaMacchina, setPotenzaMacchina] = useState("");

  // Dati Radiante
  const [superficie, setSuperficie] = useState("");
  const [passoPosa, setPassoPosa] = useState("");

  const [note, setNote] = useState("");

  useEffect(() => {
    if (initialData) {
      setTipoTermico(initialData.sotto_categoria || "radiatore");
      if (initialData.sotto_categoria === "radiatore") {
        setMateriale(initialData.materiale_key || "");
        setInterasse(initialData.interasse_key || "");
        setNumeroElementi(initialData.numero_elementi || 1);
      } else if (initialData.sotto_categoria === "split") {
        setSplitLabel(initialData.label || "");
        setSplitWatt(initialData.watt_unitario || "");
        setQuantitaSplit(initialData.quantita || 1);
      } else if (initialData.sotto_categoria === "fancoil") {
        setMarca(initialData.marca || "");
        setModello(initialData.modello || "");
        setPotenzaRisc(initialData.potenza_risc || "");
        setPotenzaRaff(initialData.potenza_raff || "");
        setQuantitaFancoil(initialData.quantita || 1);
      } else if (initialData.sotto_categoria === "canalizzato") {
        setPotenzaMacchina(initialData.potenza_macchina || "");
      } else if (initialData.sotto_categoria === "pavimento_radiante" || initialData.sotto_categoria === "soffitto_radiante") {
        setSuperficie(initialData.superficie || "");
        setPassoPosa(initialData.passo_posa || "");
        setMarca(initialData.marca || "");
        setModello(initialData.modello || "");
      }
      setNote(initialData.note || "");
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    let payload = {
      id_istanza: initialData ? initialData.id_istanza : `term_${crypto.randomUUID()}`,
      categoria: "termico",
      sotto_categoria: tipoTermico,
      note: note.trim()
    };

    if (tipoTermico === "radiatore") {
      if (!materiale || !interasse) return;

      const matObj = DIZIONARIO_RADIATORI[materiale];
      const altezzaObj = matObj?.altezze.find(a => a.id === interasse);
      const wElem = altezzaObj ? altezzaObj.watt_elemento : 0;
      const labelInterasse = altezzaObj ? altezzaObj.label : interasse;

      payload = {
        ...payload,
        materiale_key: materiale,
        interasse_key: interasse,
        tipologia: matObj ? matObj.label : materiale,
        altezza_label: labelInterasse,
        numero_elementi: parseInt(numeroElementi, 10),
        watt_per_elemento: wElem,
        carico_totale_w: wElem * parseInt(numeroElementi, 10)
      };
    } else if (tipoTermico === "split") {
      if (!splitLabel || !splitWatt) return;
      payload = {
        ...payload,
        label: splitLabel,
        watt_unitario: parseInt(splitWatt, 10),
        quantita: parseInt(quantitaSplit, 10),
        carico_totale_w: parseInt(splitWatt, 10) * parseInt(quantitaSplit, 10)
      };
    } else if (tipoTermico === "fancoil") {
      payload = {
        ...payload,
        marca: marca || "",
        modello: modello || "",
        potenza_risc: potenzaRisc ? parseInt(potenzaRisc, 10) : "",
        potenza_raff: potenzaRaff ? parseInt(potenzaRaff, 10) : "",
        quantita: quantitaFancoil ? parseInt(quantitaFancoil, 10) : 1
      };
    } else if (tipoTermico === "canalizzato") {
      payload = {
        ...payload,
        potenza_macchina: potenzaMacchina ? parseInt(potenzaMacchina, 10) : ""
      };
    } else if (tipoTermico === "pavimento_radiante" || tipoTermico === "soffitto_radiante") {
      payload = {
        ...payload,
        superficie: superficie ? parseFloat(superficie) : "",
        passo_posa: passoPosa || "",
        marca: marca || "",
        modello: modello || ""
      };
    }

    onSalva(payload);

    if (!initialData) {
      setMateriale(""); setInterasse(""); setNumeroElementi(1);
      setSplitLabel(""); setSplitWatt(""); setQuantitaSplit(1);
      setMarca(""); setModello(""); setPotenzaRisc(""); setPotenzaRaff(""); setQuantitaFancoil(1);
      setPotenzaMacchina(""); setSuperficie(""); setPassoPosa(""); setNote("");
    }
  };

  const opzioniInterassi = materiale && DIZIONARIO_RADIATORI[materiale]
      ? DIZIONARIO_RADIATORI[materiale].altezze
      : [];

  return (
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-bold uppercase mb-2">Tipologia Sistema Termico</label>
            <select
                value={tipoTermico}
                onChange={(e) => setTipoTermico(e.target.value)}
                className="w-full bg-black border-2 border-white p-4 focus:outline-none focus:border-green-500 focus:bg-green-500 focus:text-black text-white uppercase font-bold appearance-none rounded-none"
                required
            >
              <option value="radiatore">RADIATORE (ELEMENTI SFUSI)</option>
              <option value="split">SPLIT / CLIMATIZZAZIONE</option>
              <option value="fancoil">FANCOIL / VENTILCONVETTORE</option>
              <option value="canalizzato">CANALIZZATO</option>
              <option value="pavimento_radiante">PAVIMENTO RADIANTE</option>
              <option value="soffitto_radiante">SOFFITTO RADIANTE</option>
            </select>
          </div>

          {tipoTermico === "radiatore" && (
              <>
                <div>
                  <label className="block text-sm font-bold uppercase mb-2">Materiale Radiatore</label>
                  <select value={materiale} onChange={(e) => { setMateriale(e.target.value); setInterasse(""); }} className="w-full bg-black border-2 border-white p-4 focus:outline-none focus:border-green-500 focus:bg-green-500 focus:text-black text-white uppercase font-bold appearance-none rounded-none" required>
                    <option value="">-- SELEZIONA --</option>
                    {Object.entries(DIZIONARIO_RADIATORI).map(([key, data]) => (
                        <option key={key} value={key}>{data.label.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
                {materiale && (
                    <div>
                      <label className="block text-sm font-bold uppercase mb-2">Interasse / Altezza</label>
                      <select value={interasse} onChange={(e) => setInterasse(e.target.value)} className="w-full bg-black border-2 border-white p-4 focus:outline-none focus:border-green-500 focus:bg-green-500 focus:text-black text-white uppercase font-bold appearance-none rounded-none" required>
                        <option value="">-- SELEZIONA --</option>
                        {opzioniInterassi.map(int => (
                            <option key={int.id} value={int.id}>{int.label.toUpperCase()}</option>
                        ))}
                      </select>
                    </div>
                )}
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold uppercase mb-2">Numero Elementi Fisici</label>
                  <input type="number" min="1" value={numeroElementi} onChange={(e) => setNumeroElementi(e.target.value)} className="w-full bg-black border-2 border-white p-4 focus:outline-none focus:border-green-500 focus:bg-green-500 focus:text-black text-white uppercase font-bold" required />
                </div>
              </>
          )}

          {tipoTermico === "split" && (
              <>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold uppercase mb-2">Dettaglio / Modello</label>
                  <input type="text" placeholder="ES. DAIKIN INVERTER 12000 BTU" value={splitLabel} onChange={(e) => setSplitLabel(e.target.value)} className="w-full bg-black border-2 border-white p-4 focus:outline-none focus:border-green-500 focus:bg-green-500 focus:text-black text-white uppercase font-bold" required />
                </div>
                <div>
                  <label className="block text-sm font-bold uppercase mb-2">Watt Assorbiti (Dati di targa)</label>
                  <input type="number" value={splitWatt} onChange={(e) => setSplitWatt(e.target.value)} className="w-full bg-black border-2 border-white p-4 focus:outline-none focus:border-green-500 focus:bg-green-500 focus:text-black text-white uppercase font-bold" required />
                </div>
                <div>
                  <label className="block text-sm font-bold uppercase mb-2">Quantità</label>
                  <input type="number" min="1" value={quantitaSplit} onChange={(e) => setQuantitaSplit(e.target.value)} className="w-full bg-black border-2 border-white p-4 focus:outline-none focus:border-green-500 focus:bg-green-500 focus:text-black text-white uppercase font-bold" required />
                </div>
              </>
          )}

          {tipoTermico === "fancoil" && (
              <>
                <div>
                  <label className="block text-sm font-bold uppercase mb-2">Marca</label>
                  <input type="text" placeholder="ES. SABIANA" value={marca} onChange={(e) => setMarca(e.target.value)} className="w-full bg-black border-2 border-white p-4 focus:outline-none focus:border-green-500 focus:bg-green-500 focus:text-black text-white uppercase font-bold"  />
                </div>
                <div>
                  <label className="block text-sm font-bold uppercase mb-2">Modello</label>
                  <input type="text" placeholder="ES. CARISMA" value={modello} onChange={(e) => setModello(e.target.value)} className="w-full bg-black border-2 border-white p-4 focus:outline-none focus:border-green-500 focus:bg-green-500 focus:text-black text-white uppercase font-bold"  />
                </div>
                <div>
                  <label className="block text-sm font-bold uppercase mb-2">Potenza Termica Risc. (W)</label>
                  <input type="number" value={potenzaRisc} onChange={(e) => setPotenzaRisc(e.target.value)} className="w-full bg-black border-2 border-white p-4 focus:outline-none focus:border-green-500 focus:bg-green-500 focus:text-black text-white uppercase font-bold"  />
                </div>
                <div>
                  <label className="block text-sm font-bold uppercase mb-2">Potenza Termica Raff. (W)</label>
                  <input type="number" value={potenzaRaff} onChange={(e) => setPotenzaRaff(e.target.value)} className="w-full bg-black border-2 border-white p-4 focus:outline-none focus:border-green-500 focus:bg-green-500 focus:text-black text-white uppercase font-bold"  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold uppercase mb-2">Quantità Fancoil Identici</label>
                  <input type="number" min="1" value={quantitaFancoil} onChange={(e) => setQuantitaFancoil(e.target.value)} className="w-full bg-black border-2 border-white p-4 focus:outline-none focus:border-green-500 focus:bg-green-500 focus:text-black text-white uppercase font-bold"  />
                </div>
              </>
          )}

          {tipoTermico === "canalizzato" && (
              <div className="md:col-span-2">
                <label className="block text-sm font-bold uppercase mb-2">Potenza della macchina servente (W)</label>
                <input type="number" placeholder="ES. 3500" value={potenzaMacchina} onChange={(e) => setPotenzaMacchina(e.target.value)} className="w-full bg-black border-2 border-white p-4 focus:outline-none focus:border-green-500 focus:bg-green-500 focus:text-black text-white uppercase font-bold" />
              </div>
          )}

          {(tipoTermico === "pavimento_radiante" || tipoTermico === "soffitto_radiante") && (
              <>
                <div>
                  <label className="block text-sm font-bold uppercase mb-2">Superficie Locale (MQ)</label>
                  <input type="number" step="0.01" value={superficie} onChange={(e) => setSuperficie(e.target.value)} className="w-full bg-black border-2 border-white p-4 focus:outline-none focus:border-green-500 focus:bg-green-500 focus:text-black text-white uppercase font-bold" />
                </div>
                <div>
                  <label className="block text-sm font-bold uppercase mb-2">Passo di Posa (CM/MM)</label>
                  <input type="text" placeholder="ES. 10 CM" value={passoPosa} onChange={(e) => setPassoPosa(e.target.value)} className="w-full bg-black border-2 border-white p-4 focus:outline-none focus:border-green-500 focus:bg-green-500 focus:text-black text-white uppercase font-bold" />
                </div>
                <div>
                  <label className="block text-sm font-bold uppercase mb-2">Marca Sistema</label>
                  <input type="text" placeholder="ES. GIACOMINI" value={marca} onChange={(e) => setMarca(e.target.value)} className="w-full bg-black border-2 border-white p-4 focus:outline-none focus:border-green-500 focus:bg-green-500 focus:text-black text-white uppercase font-bold" />
                </div>
                <div>
                  <label className="block text-sm font-bold uppercase mb-2">Modello Sistema</label>
                  <input type="text" placeholder="ES. SPIDER" value={modello} onChange={(e) => setModello(e.target.value)} className="w-full bg-black border-2 border-white p-4 focus:outline-none focus:border-green-500 focus:bg-green-500 focus:text-black text-white uppercase font-bold" />
                </div>
              </>
          )}

          <div className="md:col-span-2">
            <label className="block text-sm font-bold uppercase mb-2">Note (Opzionale)</label>
            <input type="text" value={note} onChange={(e) => setNote(e.target.value)} className="w-full bg-black border-2 border-dashed border-white p-4 focus:outline-none focus:border-solid focus:bg-green-500 focus:text-black text-white uppercase font-bold" />
          </div>
        </div>

        <div className="flex gap-4 mt-2">
          <button type="submit" className="flex-1 bg-white text-black font-black text-xl py-4 border-4 border-white hover:bg-green-500 uppercase transition-none">
            {initialData ? "Aggiorna" : "Registra"}
          </button>
          {initialData && (
              <button type="button" onClick={onAnnulla} className="flex-1 bg-black text-white font-black text-xl py-4 border-4 border-white hover:bg-red-500 hover:text-white uppercase transition-none">
                Annulla
              </button>
          )}
        </div>
      </form>
  );
}