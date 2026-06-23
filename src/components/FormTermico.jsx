import { useState, useEffect } from "react";
import { DIZIONARIO_RADIATORI } from "../data/dizionario_radiatori";

export default function FormTermico({ onSalva, initialData = null, onAnnulla = null }) {
  const [sottoCategoria, setSottoCategoria] = useState("radiatore");
  const [materiale, setMateriale] = useState("");
  const [altezzaId, setAltezzaId] = useState("");
  const [numeroElementi, setNumeroElementi] = useState("");
  const [modelloSplit, setModelloSplit] = useState("");
  const [potenzaSplit, setPotenzaSplit] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (initialData) {
      setSottoCategoria(initialData.sotto_categoria || "radiatore");
      setMateriale(initialData.materiale_id || "");
      setAltezzaId(initialData.altezza_id || "");
      setNumeroElementi(initialData.numero_elementi || "");
      setModelloSplit(initialData.modello_split || "");
      setPotenzaSplit(initialData.watt_unitario || "");
      setNote(initialData.note || "");
    }
  }, [initialData]);

  const opzioniAltezze = materiale ? DIZIONARIO_RADIATORI[materiale].altezze : [];
  const dettagliAltezza = opzioniAltezze.find((a) => a.id === altezzaId);
  const wattPerElemento = dettagliAltezza ? dettagliAltezza.watt_elemento : 0;

  const wattTotali =
    sottoCategoria === "radiatore" ? (wattPerElemento && numeroElementi ? wattPerElemento * parseInt(numeroElementi, 10) : 0) : parseInt(potenzaSplit || 0, 10);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (sottoCategoria === "radiatore") {
      if (!materiale || !altezzaId || !numeroElementi) return;
      onSalva({
        id_istanza: initialData ? initialData.id_istanza : `rad_${crypto.randomUUID()}`,
        categoria: "termico",
        sotto_categoria: "radiatore",
        materiale_id: materiale,
        altezza_id: altezzaId,
        tipologia: DIZIONARIO_RADIATORI[materiale].label,
        altezza_label: dettagliAltezza.label,
        watt_per_elemento: wattPerElemento,
        numero_elementi: parseInt(numeroElementi, 10),
        carico_totale_w: wattTotali,
        note: note.trim(),
      });
    } else {
      if (!modelloSplit || !potenzaSplit) return;
      onSalva({
        id_istanza: initialData ? initialData.id_istanza : `spl_${crypto.randomUUID()}`,
        categoria: "termico",
        sotto_categoria: "split",
        label: `Split Clima: ${modelloSplit}`,
        modello_split: modelloSplit,
        watt_unitario: parseInt(potenzaSplit, 10),
        quantita: 1,
        carico_totale_w: wattTotali,
        note: note.trim(),
      });
    }
    if (!initialData) {
      setMateriale("");
      setAltezzaId("");
      setNumeroElementi("");
      setModelloSplit("");
      setPotenzaSplit("");
      setNote("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 border-2 border-white p-2">
        <button
          type="button"
          onClick={() => setSottoCategoria("radiatore")}
          className={`py-3 font-black uppercase text-xs transition-none ${sottoCategoria === "radiatore" ? "bg-white text-black" : "bg-black text-white hover:bg-green-500 hover:text-black"}`}
        >
          Radiatore Sfuso
        </button>
        <button
          type="button"
          onClick={() => setSottoCategoria("split")}
          className={`py-3 font-black uppercase text-xs transition-none ${sottoCategoria === "split" ? "bg-white text-black" : "bg-black text-white hover:bg-green-500 hover:text-black"}`}
        >
          Split / Climatizzazione
        </button>
      </div>

      {sottoCategoria === "radiatore" ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold uppercase mb-2">Materiale</label>
              <select
                value={materiale}
                onChange={(e) => {
                  setMateriale(e.target.value);
                  setAltezzaId("");
                }}
                className="w-full bg-black border-2 border-white p-4 focus:outline-none focus:border-green-500 focus:bg-green-500 focus:text-black text-white uppercase font-bold appearance-none rounded-none"
                required
              >
                <option value="">-- SELEZIONA --</option>
                {Object.entries(DIZIONARIO_RADIATORI).map(([key, data]) => (
                  <option key={key} value={key}>
                    {data.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold uppercase mb-2">Altezza</label>
              <select
                value={altezzaId}
                onChange={(e) => setAltezzaId(e.target.value)}
                disabled={!materiale}
                className="w-full bg-black border-2 border-white p-4 focus:outline-none focus:border-green-500 focus:bg-green-500 focus:text-black text-white uppercase font-bold disabled:opacity-30 appearance-none rounded-none"
                required
              >
                <option value="">-- SELEZIONA --</option>
                {opzioniAltezze.map((alt) => (
                  <option key={alt.id} value={alt.id}>
                    {alt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-end">
            <div className="sm:col-span-1">
              <label className="block text-sm font-bold uppercase mb-2">N. Elementi</label>
              <input
                type="number"
                min="1"
                value={numeroElementi}
                onChange={(e) => setNumeroElementi(e.target.value)}
                className="w-full bg-black border-2 border-white p-4 focus:outline-none focus:border-green-500 focus:bg-green-500 focus:text-black text-white uppercase font-bold"
                required
              />
            </div>
            <div className="sm:col-span-2 border-4 border-green-500 p-4 flex flex-col justify-center items-center h-[60px] bg-black">
              {wattTotali > 0 ? (
                <span className="text-xl font-black text-green-500 uppercase">
                  {wattTotali} W <span className="text-sm text-white ml-2">({wattPerElemento}W/EL)</span>
                </span>
              ) : (
                <span className="text-sm font-bold uppercase text-gray-500">RESA TERMICA</span>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold uppercase mb-2">Modello / Sigla Unità</label>
            <input
              type="text"
              placeholder="ES. DAIKIN SENSIRA"
              value={modelloSplit}
              onChange={(e) => setModelloSplit(e.target.value)}
              className="w-full bg-black border-2 border-white p-4 focus:outline-none focus:border-green-500 focus:bg-green-500 focus:text-black text-white uppercase font-bold"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold uppercase mb-2">Potenza Nominale (W)</label>
            <input
              type="number"
              placeholder="3500"
              value={potenzaSplit}
              onChange={(e) => setPotenzaSplit(e.target.value)}
              className="w-full bg-black border-2 border-white p-4 focus:outline-none focus:border-green-500 focus:bg-green-500 focus:text-black text-white uppercase font-bold"
              required
            />
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-bold uppercase mb-2">Note / Ubicazione</label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full bg-black border-2 border-dashed border-white p-4 focus:outline-none focus:border-solid focus:bg-green-500 focus:text-black text-white uppercase font-bold"
        />
      </div>

      <div className="flex gap-4 mt-2">
        <button type="submit" className="flex-1 bg-white text-black font-black text-xl py-4 border-4 border-white hover:bg-green-500 uppercase transition-none">
          {initialData ? "Aggiorna" : "Registra Componente"}
        </button>
        {initialData && (
          <button
            type="button"
            onClick={onAnnulla}
            className="flex-1 bg-black text-white font-black text-xl py-4 border-4 border-white hover:bg-red-500 uppercase transition-none"
          >
            Annulla
          </button>
        )}
      </div>
    </form>
  );
}
