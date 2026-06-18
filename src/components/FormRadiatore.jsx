import { useState } from "react";
import { DIZIONARIO_RADIATORI } from "../data/dizionario_radiatori";

export default function FormRadiatore({ onSalva }) {
  const [materiale, setMateriale] = useState("");
  const [altezzaId, setAltezzaId] = useState("");
  const [numeroElementi, setNumeroElementi] = useState("");
  const [note, setNote] = useState("");

  const opzioniAltezze = materiale ? DIZIONARIO_RADIATORI[materiale].altezze : [];
  const dettagliAltezza = opzioniAltezze.find((a) => a.id === altezzaId);

  const wattPerElemento = dettagliAltezza ? dettagliAltezza.watt_elemento : 0;
  const wattTotali = wattPerElemento && numeroElementi ? wattPerElemento * parseInt(numeroElementi) : 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!materiale || !altezzaId || !numeroElementi) return;
    onSalva({
      id_istanza: `rad_${crypto.randomUUID()}`,
      categoria: "termico",
      tipologia: DIZIONARIO_RADIATORI[materiale].label,
      altezza_label: dettagliAltezza.label,
      watt_per_elemento: wattPerElemento,
      numero_elementi: parseInt(numeroElementi, 10),
      carico_totale_w: wattTotali,
      note: note.trim(),
    });
    setMateriale("");
    setAltezzaId("");
    setNumeroElementi("");
    setNote("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
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
            className="w-full bg-black border-2 border-white p-4 focus:outline-none focus:border-green-500 focus:bg-green-500 focus:text-black text-white uppercase font-bold disabled:opacity-30 disabled:border-gray-600 appearance-none rounded-none"
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
            <span className="text-sm font-bold uppercase text-gray-500">RESA TERMICA...</span>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold uppercase mb-2">Note</label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full bg-black border-2 border-dashed border-white p-4 focus:outline-none focus:border-green-500 focus:border-solid focus:bg-green-500 focus:text-black text-white uppercase font-bold"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-white text-black font-black text-xl py-4 mt-2 border-4 border-white hover:bg-green-500 hover:border-green-500 uppercase transition-none"
      >
        Registra Radiatore
      </button>
    </form>
  );
}
