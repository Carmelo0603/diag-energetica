import { useState } from "react";

const ASSET_COMUNI = [
  { id: "neon_18", label: "Plafoniera Neon 18W", watt: 18, tipo: "luci", categoria: "illuminazione" },
  { id: "neon_36", label: "Plafoniera Neon 36W", watt: 36, tipo: "luci", categoria: "illuminazione" },
  { id: "led_40", label: "Pannello LED 40W", watt: 40, tipo: "luci", categoria: "illuminazione" },
  { id: "faretto_10", label: "Faretto LED 10W", watt: 10, tipo: "luci", categoria: "illuminazione" },
  { id: "lim", label: "LIM / Monitor", watt: 250, tipo: "apparecchi", categoria: "apparecchio" },
  { id: "proiettore", label: "Videoproiettore", watt: 300, tipo: "apparecchi", categoria: "apparecchio" },
  { id: "pc_fisso", label: "PC Fisso", watt: 200, tipo: "apparecchi", categoria: "apparecchio" },
  { id: "pc_portatile", label: "Laptop", watt: 65, tipo: "apparecchi", categoria: "apparecchio" },
  { id: "stampante", label: "Stampante", watt: 500, tipo: "apparecchi", categoria: "apparecchio" },
  { id: "split", label: "Split Clima", watt: 1000, tipo: "apparecchi", categoria: "climatizzazione" },
];

export default function FormApparecchio({ onSalva, tipoForm }) {
  const [assetId, setAssetId] = useState("");
  const [customLabel, setCustomLabel] = useState("");
  const [customWatt, setCustomWatt] = useState("");
  const [quantita, setQuantita] = useState(1);
  const [note, setNote] = useState("");

  const opzioniFiltrate = ASSET_COMUNI.filter((a) => a.tipo === tipoForm);
  const isCustom = assetId === "custom";

  const handleSubmit = (e) => {
    e.preventDefault();
    let label, watt, categoria;
    if (isCustom) {
      if (!customLabel || !customWatt) return;
      label = customLabel;
      watt = parseInt(customWatt, 10);
      categoria = tipoForm === "luci" ? "illuminazione" : "apparecchio";
    } else {
      const asset = opzioniFiltrate.find((a) => a.id === assetId);
      if (!asset) return;
      label = asset.label;
      watt = asset.watt;
      categoria = asset.categoria;
    }
    onSalva({
      id_istanza: `app_${crypto.randomUUID()}`,
      categoria,
      label,
      watt_unitario: watt,
      quantita: parseInt(quantita, 10),
      carico_totale_w: watt * parseInt(quantita, 10),
      note: note.trim(),
    });
    setAssetId("");
    setCustomLabel("");
    setCustomWatt("");
    setQuantita(1);
    setNote("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div>
        <label className="block text-sm font-bold uppercase mb-2">{tipoForm === "luci" ? "Corpo Illuminante" : "Apparecchiatura"}</label>
        <select
          value={assetId}
          onChange={(e) => setAssetId(e.target.value)}
          className="w-full bg-black border-2 border-white p-4 focus:outline-none focus:border-green-500 focus:bg-green-500 focus:text-black text-white uppercase font-bold appearance-none rounded-none"
          required
        >
          <option value="">-- SELEZIONA --</option>
          {opzioniFiltrate.map((a) => (
            <option key={a.id} value={a.id}>
              {a.label} ({a.watt}W)
            </option>
          ))}
          <option disabled>──────────</option>
          <option value="custom">+ MANUALE</option>
        </select>
      </div>

      {isCustom && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 border-4 border-green-500">
          <div>
            <label className="block text-sm font-bold uppercase text-green-500 mb-2">Nome Asset</label>
            <input
              type="text"
              value={customLabel}
              onChange={(e) => setCustomLabel(e.target.value)}
              required
              className="w-full bg-black border-2 border-white p-4 focus:outline-none focus:border-green-500 focus:bg-green-500 focus:text-black text-white uppercase font-bold"
            />
          </div>
          <div>
            <label className="block text-sm font-bold uppercase text-green-500 mb-2">Watt Unitari</label>
            <input
              type="number"
              value={customWatt}
              onChange={(e) => setCustomWatt(e.target.value)}
              required
              className="w-full bg-black border-2 border-white p-4 focus:outline-none focus:border-green-500 focus:bg-green-500 focus:text-black text-white uppercase font-bold"
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 items-end">
        <div className="sm:col-span-1">
          <label className="block text-sm font-bold uppercase mb-2">Q.ta</label>
          <input
            type="number"
            min="1"
            value={quantita}
            onChange={(e) => setQuantita(e.target.value)}
            required
            className="w-full bg-black border-2 border-white p-4 focus:outline-none focus:border-green-500 focus:bg-green-500 focus:text-black text-white uppercase font-bold"
          />
        </div>
        <div className="sm:col-span-3">
          <label className="block text-sm font-bold uppercase mb-2">Note (Opzionale)</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full bg-black border-2 border-dashed border-white p-4 focus:outline-none focus:border-green-500 focus:border-solid focus:bg-green-500 focus:text-black text-white uppercase font-bold"
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-white text-black font-black text-xl py-4 mt-2 border-4 border-white hover:bg-green-500 hover:border-green-500 uppercase transition-none"
      >
        Registra
      </button>
    </form>
  );
}
