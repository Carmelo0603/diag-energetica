import { db } from "../db/database";
import * as XLSX from "xlsx";

export async function esportaRilievoExcel(idEdificio, tipoExport) {
  try {
    const edificio = await db.edifici.get(idEdificio);
    const ambienti = await db.ambienti.where("id_edificio").equals(idEdificio).toArray();

    if (!edificio) throw new Error("Edificio non trovato");

    const righeIlluminazione = [];
    const righeTermico = [];
    const righeApparecchi = [];

    ambienti.forEach((ambiente) => {
      if (ambiente.elementi_inseriti && ambiente.elementi_inseriti.length > 0) {
        ambiente.elementi_inseriti.forEach((el) => {
          if (el.categoria === "illuminazione") {
            righeIlluminazione.push({
              Ambiente: ambiente.nome,
              Target_Lux: ambiente.lux_normativi || "N/A",
              Dettaglio_Elemento: el.label,
              Watt_Unitario: el.watt_unitario,
              Quantita: el.quantita,
              Carico_Totale_W: el.carico_totale_w,
            });
          } else if (el.categoria === "termico") {
            righeTermico.push({
              Ambiente: ambiente.nome,
              Dettaglio_Elemento: `${el.tipologia} - ${el.altezza_label}`,
              Watt_Unitario: el.watt_per_elemento,
              Elementi: el.numero_elementi,
              Carico_Totale_W: el.carico_totale_w,
            });
          } else {
            righeApparecchi.push({
              Ambiente: ambiente.nome,
              Dettaglio_Elemento: el.label,
              Watt_Unitario: el.watt_unitario,
              Quantita: el.quantita,
              Carico_Totale_W: el.carico_totale_w,
            });
          }
        });
      }
    });

    if (righeIlluminazione.length > 0) {
      const totQuantita = righeIlluminazione.reduce((acc, curr) => acc + (Number(curr.Quantita) || 0), 0);
      const totWatt = righeIlluminazione.reduce((acc, curr) => acc + (Number(curr.Carico_Totale_W) || 0), 0);
      righeIlluminazione.push({
        Ambiente: "TOTALE GENERALE",
        Target_Lux: "",
        Dettaglio_Elemento: "",
        Watt_Unitario: "",
        Quantita: totQuantita,
        Carico_Totale_W: totWatt,
      });
    }

    if (righeTermico.length > 0) {
      const totElementi = righeTermico.reduce((acc, curr) => acc + (Number(curr.Elementi) || 0), 0);
      const totWatt = righeTermico.reduce((acc, curr) => acc + (Number(curr.Carico_Totale_W) || 0), 0);
      righeTermico.push({
        Ambiente: "TOTALE GENERALE",
        Dettaglio_Elemento: "",
        Watt_Unitario: "",
        Elementi: totElementi,
        Carico_Totale_W: totWatt,
      });
    }

    if (righeApparecchi.length > 0) {
      const totQuantita = righeApparecchi.reduce((acc, curr) => acc + (Number(curr.Quantita) || 0), 0);
      const totWatt = righeApparecchi.reduce((acc, curr) => acc + (Number(curr.Carico_Totale_W) || 0), 0);
      righeApparecchi.push({
        Ambiente: "TOTALE GENERALE",
        Dettaglio_Elemento: "",
        Watt_Unitario: "",
        Quantita: totQuantita,
        Carico_Totale_W: totWatt,
      });
    }

    const workbook = XLSX.utils.book_new();

    if (tipoExport === "tutto" || tipoExport === "illuminazione") {
      const wsIlluminazione = XLSX.utils.json_to_sheet(righeIlluminazione.length > 0 ? righeIlluminazione : [{ Note: "Nessun elemento" }]);
      XLSX.utils.book_append_sheet(workbook, wsIlluminazione, "Illuminazione");
    }

    if (tipoExport === "tutto" || tipoExport === "termico") {
      const wsTermico = XLSX.utils.json_to_sheet(righeTermico.length > 0 ? righeTermico : [{ Note: "Nessun elemento" }]);
      XLSX.utils.book_append_sheet(workbook, wsTermico, "Termico");
    }

    if (tipoExport === "tutto" || tipoExport === "apparecchi") {
      const wsApparecchi = XLSX.utils.json_to_sheet(righeApparecchi.length > 0 ? righeApparecchi : [{ Note: "Nessun elemento" }]);
      XLSX.utils.book_append_sheet(workbook, wsApparecchi, "Apparecchiature");
    }

    const suffisso = tipoExport === "tutto" ? "Completo" : tipoExport.charAt(0).toUpperCase() + tipoExport.slice(1);
    const nomeFile = `Rilievo_${edificio.nome.replace(/\s+/g, "_")}_${suffisso}.xlsx`;
    XLSX.writeFile(workbook, nomeFile);
  } catch (error) {
    alert("Errore nell'esportazione del file.");
  }
}
