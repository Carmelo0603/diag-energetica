import { useState, useEffect } from "react";

export default function FormInfissi({ onSalva, initialData = null, onAnnulla = null }) {
  const [tipologia, setTipologia] = useState("");
  const [tipoVetro, setTipoVetro] = useState("");
  const [quantita, setQuantita] = useState(1);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (initialData) {
      setTipologia(initialData.tipologia || "");
      setTipoVetro(initialData.tipo_vetro || "");
      setQuantita(initialData.quantita || 1);
      setNote(initialData.note || "");
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!tipologia || !tipoVetro) return;
    onSalva({
      id_istanza: initialData ? initialData.id_istanza : `inf_${crypto.randomUUID()}`,
      categoria: "infissi",
      tipologia,
      tipo_vetro: tipoVetro,
      quantita: parseInt(quantita, 10),
      note: note.trim(),
    });
    if (!initialData) {
      setTipologia("");
      setTipoVetro("");
      setQuantita(1);
      setNote("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-bold uppercase mb-2">Tipologia Telaio</label>
          <select
            value={tipologia}
            onChange={(e) => setTipologia(e.target.value)}
            className="w-full bg-black border-2 border-white p-4 focus:outline-none focus:border-green-500 focus:bg-green-500 focus:text-black text-white uppercase font-bold appearance-none rounded-none"
            required
          >
            <option value="">-- SELEZIONA TELAIO --</option>
            <option value="PVC">PVC</option>
            <option value="LEGNO">LEGNO NATURALE</option>
            <option value="ALLUMINIO-TAGLIO-FREDDO">ALLUMINIO TAGLIO FREDDO</option>
            <option value="ALLUMINIO-TAGLIO-TERMICO">ALLUMINIO TAGLIO TERMICO</option>
            <option value="LEGNO-ALLUMINIO">LEGNO-ALLUMINIO</option>
            <option value="FERRO">FERRO / ACCIAIO</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold uppercase mb-2">Tipo di Vetro</label>
          <select
            value={tipoVetro}
            onChange={(e) => setTipoVetro(e.target.value)}
            className="w-full bg-black border-2 border-white p-4 focus:outline-none focus:border-green-500 focus:bg-green-500 focus:text-black text-white uppercase font-bold appearance-none rounded-none"
            required
          >
            <option value="">-- SELEZIONA VETRO --</option>
            <option value="SINGOLO">VETRO SINGOLO STANDARD</option>
            <option value="DOPPIO-STANDARD">DOPPIO VETRO (4-12-4)</option>
            <option value="DOPPIO-BASSO-EMISSIVO">DOPPIO VETRO BASSO EMISSIVO</option>
            <option value="TRIPLO-ARGON">TRIPLO VETRO CON GAS ARGON</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-bold uppercase mb-2">Numero di Infissi Identici</label>
        <input
          type="number"
          min="1"
          value={quantita}
          onChange={(e) => setQuantita(e.target.value)}
          className="w-full bg-black border-2 border-white p-4 focus:outline-none focus:border-green-500 focus:bg-green-500 focus:text-black text-white uppercase font-bold"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-bold uppercase mb-2">Dimensioni / Note (Opzionale)</label>
        <input
          type="text"
          placeholder="ES. 120X150 CM"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full bg-black border-2 border-dashed border-white p-4 focus:outline-none focus:border-solid focus:bg-green-500 focus:text-black text-white uppercase font-bold"
        />
      </div>
      <div className="flex gap-4 mt-2">
        <button type="submit" className="flex-1 bg-white text-black font-black text-xl py-4 border-4 border-white hover:bg-green-500 uppercase transition-none">
          {initialData ? "Aggiorna Infisso" : "Registra Infisso"}
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
