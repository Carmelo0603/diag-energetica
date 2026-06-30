import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/database";

const ASSET_LUCI = [
  { id: "t8_60", label: "Tubo Fluorescente T8 60cm", watt: 18, lumen: 1350, tipo: "luci", categoria: "illuminazione" },
  { id: "t8_90", label: "Tubo Fluorescente T8 90cm", watt: 30, lumen: 2400, tipo: "luci", categoria: "illuminazione" },
  { id: "t8_120", label: "Tubo Fluorescente T8 120cm", watt: 36, lumen: 3350, tipo: "luci", categoria: "illuminazione" },
  { id: "cfl_e27", label: "CFL Spirale/Globo E27", watt: 23, lumen: 1450, tipo: "luci", categoria: "illuminazione" },
  { id: "cfl_plc", label: "CFL Pro PL-C Pin G24q", watt: 26, lumen: 1800, tipo: "luci", categoria: "illuminazione" },
  { id: "alo_gu53", label: "Faretto Alogeno Dicroico GU5.3", watt: 50, lumen: 680, tipo: "luci", categoria: "illuminazione" },
];

const ASSET_SCUOLE_UFFICI = [
  { id: "affettatrice", label: "Affettatrice professionale", watt: 400, tipo: "apparecchi", categoria: "apparecchio" },
  { id: "amplificatore", label: "Amplificatore audio / Sistema PA", watt: 150, tipo: "apparecchi", categoria: "apparecchio" },
  { id: "armadio_ricarica", label: "Armadio carrello di ricarica per 36 tablet/notebook", watt: 1200, tipo: "apparecchi", categoria: "apparecchio" },
  { id: "ascensore", label: "Ascensore elettrico (In spunto)", watt: 7500, tipo: "apparecchi", categoria: "apparecchio" },
  { id: "asciugacapelli", label: "Asciugacapelli a parete a pulsante", watt: 1200, tipo: "apparecchi", categoria: "apparecchio" },
  { id: "asciugamani", label: "Asciugamani elettrico a fotocellula", watt: 1800, tipo: "apparecchi", categoria: "apparecchio" },
  { id: "cappa", label: "Cappa aspirante industriale per cucina", watt: 1500, tipo: "apparecchi", categoria: "apparecchio" },
  { id: "centralina", label: "Centralina impianto antincendio / fumi", watt: 150, tipo: "apparecchi", categoria: "apparecchio" },
  { id: "compressore", label: "Compressore elettrico portatile", watt: 250, tipo: "apparecchi", categoria: "apparecchio" },
  { id: "cyclette", label: "Cyclette / Ergometro professionale", watt: 50, tipo: "apparecchi", categoria: "apparecchio" },
  { id: "dae", label: "Defibrillatore semiautomatico DAE (In ricarica)", watt: 40, tipo: "apparecchi", categoria: "apparecchio" },
  { id: "distr_calde", label: "Distributore bevande calde", watt: 1500, tipo: "apparecchi", categoria: "apparecchio" },
  { id: "distr_snack", label: "Distributore snack e bibite", watt: 600, tipo: "apparecchi", categoria: "apparecchio" },
  { id: "distr_acqua", label: "Distributore acqua fresca", watt: 350, tipo: "apparecchi", categoria: "apparecchio" },
  { id: "distr_bibite", label: "Distributore bibite fresche", watt: 500, tipo: "apparecchi", categoria: "apparecchio" },
  { id: "microonde", label: "Forno a microonde", watt: 1200, tipo: "apparecchi", categoria: "apparecchio" },
  { id: "forno_ind", label: "Forno elettrico industriale a convezione", watt: 9000, tipo: "apparecchi", categoria: "apparecchio" },
  { id: "fotocopiatrice", label: "Fotocopiatrice multifunzione", watt: 1000, tipo: "apparecchi", categoria: "apparecchio" },
  { id: "frigo_res", label: "Frigorifero cucina residenziale", watt: 600, tipo: "apparecchi", categoria: "apparecchio" },
  { id: "frigo_ind", label: "Frigorifero industriale a colonna", watt: 800, tipo: "apparecchi", categoria: "apparecchio" },
  { id: "lampada_braccio", label: "Lampada a braccio con lente", watt: 25, tipo: "apparecchi", categoria: "apparecchio" },
  { id: "lavastoviglie_ind", label: "Lavastoviglie industriale rapida", watt: 6500, tipo: "apparecchi", categoria: "apparecchio" },
  { id: "lim", label: "LIM / Monitor Interattivo", watt: 450, tipo: "apparecchi", categoria: "apparecchio" },
  { id: "caffe_cialde", label: "Macchina caffè a cialde", watt: 1000, tipo: "apparecchi", categoria: "apparecchio" },
  { id: "caffe_monete", label: "Macchina caffè a monete", watt: 1500, tipo: "apparecchi", categoria: "apparecchio" },
  { id: "pc_fisso", label: "PC Fisso", watt: 200, tipo: "apparecchi", categoria: "apparecchio" },
  { id: "split", label: "Split Clima", watt: 1000, tipo: "apparecchi", categoria: "climatizzazione" },
];

const ASSET_CASA_DI_RIPOSO = [
  { id: "rsa_abbattitore", label: "Abbattitore di temperatura (5-7 teglie)", watt: 1800, tipo: "apparecchi", categoria: "apparecchio" },
  { id: "rsa_affettatrice", label: "Affettatrice / Tritacarne professionale", watt: 450, tipo: "apparecchi", categoria: "apparecchio" },
  { id: "rsa_phon", label: "Asciugacapelli / Phon a parete (Bagni)", watt: 1200, tipo: "apparecchi", categoria: "apparecchio" },
  { id: "rsa_cappa", label: "Cappa di aspirazione a compensazione", watt: 1200, tipo: "apparecchi", categoria: "apparecchio" },
  { id: "rsa_cella", label: "Cella frigorifera (motore e sbrinamento)", watt: 2500, tipo: "apparecchi", categoria: "apparecchio" },
  { id: "rsa_cuocipasta", label: "Cuocipasta elettrico a vasca", watt: 8500, tipo: "apparecchi", categoria: "apparecchio" },
  { id: "rsa_distr_calde", label: "Distributore automatico bevande calde", watt: 1800, tipo: "apparecchi", categoria: "apparecchio" },
  { id: "rsa_essiccatoio", label: "Essiccatoio industriale (pompa di calore)", watt: 5000, tipo: "apparecchi", categoria: "apparecchio" },
  { id: "rsa_forno", label: "Forno industriale combinato (10 teglie)", watt: 16500, tipo: "apparecchi", categoria: "apparecchio" },
  { id: "rsa_friggitrice", label: "Friggitrice industriale (doppia vasca)", watt: 12000, tipo: "apparecchi", categoria: "apparecchio" },
  { id: "rsa_frigo_farmaci", label: "Frigorifero per farmaci e vaccini", watt: 250, tipo: "apparecchi", categoria: "apparecchio" },
  { id: "rsa_lavastoviglie", label: "Lavastoviglie a capote (con boiler)", watt: 9500, tipo: "apparecchi", categoria: "apparecchio" },
  { id: "rsa_lavatrice", label: "Lavatrice industriale (20-25 kg)", watt: 18000, tipo: "apparecchi", categoria: "apparecchio" },
  { id: "rsa_letto", label: "Letto ortopedico elettrificato", watt: 350, tipo: "apparecchi", categoria: "apparecchio" },
  { id: "rsa_mangano", label: "Mangano (stiratrice a rullo)", watt: 9000, tipo: "apparecchi", categoria: "apparecchio" },
  { id: "rsa_materasso", label: "Materasso antidecubito (compressore)", watt: 30, tipo: "apparecchi", categoria: "apparecchio" },
  { id: "rsa_pc_desk", label: "PC Desktop + Monitor (Uffici)", watt: 250, tipo: "apparecchi", categoria: "apparecchio" },
  { id: "rsa_pc_note", label: "PC Notebook (Infermeria)", watt: 60, tipo: "apparecchi", categoria: "apparecchio" },
  { id: "rsa_induzione", label: "Piano cottura induzione prof. (4 zone)", watt: 14000, tipo: "apparecchi", categoria: "apparecchio" },
  { id: "rsa_radio", label: "Radio / Sistema filodiffusione", watt: 80, tipo: "apparecchi", categoria: "apparecchio" },
  { id: "rsa_server", label: "Server di rete + Switch + Router", watt: 400, tipo: "apparecchi", categoria: "apparecchio" },
  { id: "rsa_sollevatore", label: "Sollevatore a binario o mobile", watt: 450, tipo: "apparecchi", categoria: "apparecchio" },
  { id: "rsa_stampante", label: "Stampante Inkjet / Getto d'inchiostro", watt: 40, tipo: "apparecchi", categoria: "apparecchio" },
  { id: "rsa_tv", label: "TV LED 32/43 Pollici (Camere / Sala)", watt: 50, tipo: "apparecchi", categoria: "apparecchio" },
  { id: "rsa_split", label: "Split Clima", watt: 1000, tipo: "apparecchi", categoria: "climatizzazione" }
];

export default function FormApparecchio({ onSalva, tipoForm, initialData = null, onAnnulla = null }) {
  const { idAmbiente } = useParams();

  const ambiente = useLiveQuery(() => idAmbiente ? db.ambienti.get(idAmbiente) : null, [idAmbiente]);
  const edificio = useLiveQuery(() => ambiente ? db.edifici.get(ambiente.id_edificio) : null, [ambiente]);

  const isCasaRiposo = edificio?.tipologia === "casa_riposo";
  const ASSET_CORRENTI = tipoForm === "luci" ? ASSET_LUCI : (isCasaRiposo ? ASSET_CASA_DI_RIPOSO : ASSET_SCUOLE_UFFICI);
  const TUTTI_GLI_ASSET = [...ASSET_LUCI, ...ASSET_SCUOLE_UFFICI, ...ASSET_CASA_DI_RIPOSO];

  const [assetId, setAssetId] = useState("");
  const [customLabel, setCustomLabel] = useState("");
  const [customWatt, setCustomWatt] = useState("");
  const [customLumen, setCustomLumen] = useState("");
  const [note, setNote] = useState("");

  const [puntiLuce, setPuntiLuce] = useState(1);
  const [lampadePerPunto, setLampadePerPunto] = useState(1);
  const [quantitaApparecchi, setQuantitaApparecchi] = useState(1);

  const isCustom = assetId === "custom";
  const isLuci = tipoForm === "luci";

  useEffect(() => {
    if (initialData) {
      const isKnownAsset = TUTTI_GLI_ASSET.find((a) => a.label === initialData.label);
      if (isKnownAsset) {
        setAssetId(isKnownAsset.id);
      } else {
        setAssetId("custom");
        setCustomLabel(initialData.label);
        setCustomWatt(initialData.watt_unitario);
        setCustomLumen(initialData.lumen_cad || "");
      }
      setPuntiLuce(initialData.punti_luce || 1);
      setLampadePerPunto(initialData.lampade_per_punto || 1);
      setQuantitaApparecchi(initialData.quantita || 1);
      setNote(initialData.note || "");
    }
  }, [initialData]);

  const quantitaTotaleLuci = parseInt(puntiLuce || 1, 10) * parseInt(lampadePerPunto || 1, 10);
  const assetSelezionato = ASSET_CORRENTI.find((a) => a.id === assetId);
  const lumenUnitari = isCustom ? parseInt(customLumen || 0, 10) : assetSelezionato?.lumen || 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    let label, watt, categoria;

    if (isCustom) {
      if (!customLabel || !customWatt) return;
      label = customLabel;
      watt = parseInt(customWatt, 10);
      categoria = isLuci ? "illuminazione" : "apparecchio";
    } else {
      if (!assetSelezionato) return;
      label = assetSelezionato.label;
      watt = assetSelezionato.watt;
      categoria = assetSelezionato.categoria;
    }

    const quantitaFinale = isLuci ? quantitaTotaleLuci : parseInt(quantitaApparecchi, 10);

    onSalva({
      id_istanza: initialData ? initialData.id_istanza : `app_${crypto.randomUUID()}`,
      categoria,
      label,
      watt_unitario: watt,
      punti_luce: isLuci ? parseInt(puntiLuce, 10) : null,
      lampade_per_punto: isLuci ? parseInt(lampadePerPunto, 10) : null,
      quantita: quantitaFinale,
      carico_totale_w: watt * quantitaFinale,
      lumen_cad: isLuci ? lumenUnitari : null,
      lumen_tot: isLuci ? lumenUnitari * quantitaFinale : null,
      note: note.trim(),
    });

    if (!initialData) {
      setAssetId("");
      setCustomLabel("");
      setCustomWatt("");
      setCustomLumen("");
      setNote("");
      setPuntiLuce(1);
      setLampadePerPunto(1);
      setQuantitaApparecchi(1);
    }
  };

  return (
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div>
          <label className="block text-sm font-bold uppercase mb-2">{isLuci ? "Corpo Illuminante" : "Apparecchiatura"}</label>
          <select
              value={assetId}
              onChange={(e) => setAssetId(e.target.value)}
              className="w-full bg-black border-2 border-white p-4 focus:outline-none focus:border-green-500 focus:bg-green-500 focus:text-black text-white uppercase font-bold appearance-none rounded-none"
              required
          >
            <option value="">-- SELEZIONA --</option>
            {ASSET_CORRENTI.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.label} ({a.watt}W)
                </option>
            ))}
            <option disabled>──────────</option>
            <option value="custom">+ MANUALE</option>
          </select>
        </div>

        {isCustom && (
            <div className={`grid grid-cols-1 ${isLuci ? "sm:grid-cols-3" : "sm:grid-cols-2"} gap-6 p-6 border-4 border-green-500`}>
              <div>
                <label className="block text-sm font-bold uppercase text-green-500 mb-2">Nome Asset</label>
                <input
                    type="text"
                    value={customLabel}
                    onChange={(e) => setCustomLabel(e.target.value)}
                    required
                    className="w-full bg-black border-2 border-white p-4 focus:outline-none focus:bg-green-500 focus:text-black text-white uppercase font-bold"
                />
              </div>
              <div>
                <label className="block text-sm font-bold uppercase text-green-500 mb-2">Watt / CAD</label>
                <input
                    type="number"
                    value={customWatt}
                    onChange={(e) => setCustomWatt(e.target.value)}
                    required
                    className="w-full bg-black border-2 border-white p-4 focus:outline-none focus:bg-green-500 focus:text-black text-white uppercase font-bold"
                />
              </div>
              {isLuci && (
                  <div>
                    <label className="block text-sm font-bold uppercase text-green-500 mb-2">Lumen / CAD</label>
                    <input
                        type="number"
                        value={customLumen}
                        onChange={(e) => setCustomLumen(e.target.value)}
                        required
                        className="w-full bg-black border-2 border-white p-4 focus:outline-none focus:bg-green-500 focus:text-black text-white uppercase font-bold"
                    />
                  </div>
              )}
            </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-end">
          {isLuci ? (
              <>
                <div className="sm:col-span-3">
                  <label className="block text-sm font-bold uppercase mb-2">Punti Luce</label>
                  <input
                      type="number"
                      min="1"
                      value={puntiLuce}
                      onChange={(e) => setPuntiLuce(e.target.value)}
                      required
                      className="w-full bg-black border-2 border-white p-4 focus:outline-none focus:bg-green-500 focus:text-black text-white uppercase font-bold"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-sm font-bold uppercase mb-2">Lamp./Punto</label>
                  <input
                      type="number"
                      min="1"
                      value={lampadePerPunto}
                      onChange={(e) => setLampadePerPunto(e.target.value)}
                      required
                      className="w-full bg-black border-2 border-white p-4 focus:outline-none focus:bg-green-500 focus:text-black text-white uppercase font-bold"
                  />
                </div>
                <div className="sm:col-span-6 flex flex-col h-[60px] justify-center items-center border-4 border-green-500 bg-black">
              <span className="text-xl font-black text-green-500">
                {quantitaTotaleLuci} <span className="text-white text-sm">LAMP.</span> | {lumenUnitari * quantitaTotaleLuci}{" "}
                <span className="text-white text-sm">LM TOT.</span>
              </span>
                </div>
              </>
          ) : (
              <div className="sm:col-span-3">
                <label className="block text-sm font-bold uppercase mb-2">Q.ta</label>
                <input
                    type="number"
                    min="1"
                    value={quantitaApparecchi}
                    onChange={(e) => setQuantitaApparecchi(e.target.value)}
                    required
                    className="w-full bg-black border-2 border-white p-4 focus:outline-none focus:bg-green-500 focus:text-black text-white uppercase font-bold"
                />
              </div>
          )}
          <div className="sm:col-span-12">
            <label className="block text-sm font-bold uppercase mb-2">Note</label>
            <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full bg-black border-2 border-dashed border-white p-4 focus:outline-none focus:border-solid focus:bg-green-500 focus:text-black text-white uppercase font-bold"
            />
          </div>
        </div>

        <div className="flex gap-4 mt-2">
          <button
              type="submit"
              className="flex-1 bg-white text-black font-black text-xl py-4 border-4 border-white hover:bg-green-500 hover:border-green-500 uppercase transition-none"
          >
            {initialData ? "Aggiorna" : "Registra"}
          </button>
          {initialData && (
              <button
                  type="button"
                  onClick={onAnnulla}
                  className="flex-1 bg-black text-white font-black text-xl py-4 border-4 border-white hover:border-red-500 hover:text-red-500 uppercase transition-none"
              >
                Annulla
              </button>
          )}
        </div>
      </form>
  );
}