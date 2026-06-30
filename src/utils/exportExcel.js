import { db } from "../db/database";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const REQUISITI_ILLUMINOTECNICI = [
  [
    "Piano",
    "Ambiente / Attività",
    "Illuminamento Medio Mantenuto (Em - lux)",
    "Limite di Abbagliamento (UGRL)",
    "Indice Resa Cromatica Minima (Ra)",
    "Riferimento Normativo Principale",
    "Note di Progetto / Prescrizioni",
  ],
  ["-", "Aule d'infanzia / Asili nido", 300, 19, 80, "UNI EN 12464-1:2021", "Evitare abbagliamento diretto sui tappeti di gioco."],
  [
    "-",
    "Aule di lezione diurne (Scuole di ogni ordine e grado)",
    300,
    19,
    80,
    "UNI EN 12464-1:2021 / UNI 10840",
    "Illuminamento sul piano di lavoro orizzontale (h = 0,85 m).",
  ],
  ["-", "Aule per corsi serali e istruzione adults", 500, 19, 80, "UNI EN 12464-1:2021", "Livello incrementato per compensare la mancanza di luce naturale."],
  ["-", "Aule di disegno tecnico", 750, 16, 80, "UNI EN 12464-1:2021 / UNI 10840", "Requisito stringente sull'abbagliamento (UGR max 16)."],
  ["-", "Aule di disegno e arte (Scuole d'arte)", 500, 19, 90, "UNI EN 12464-1:2021", "Ra minimo 90 per garantire la corretta percezione del colore."],
];

const STATO_DI_FATTO = [
  ["Piano", "CATEGORIA", "POTENZA LAMPADA (W)", "PERDITE ALIMENTATORE (W)", "POTENZA REALE ASSORBITA (W)", "FLUSSO LUMINOSO NOMINALE (lm)"],
  ["-", "Tubo Fluorescente T8 60 cm / G13", 18, "4 (Ferromagnetico)", 22, 1350],
  ["-", "Tubo Fluorescente T8 120 cm / G13", 12, "8 (Ferromagnetico)", 44, 3350],
  ["-", "Applique LED da parete uscite di sicurezza", 36, "8 (Ferromagnetico)", 44, 1000],
  ["-", "Plafoniera rettangolare 120x30", 40, "8 (Ferromagnetico)", 44, 4000],
  ["-", "Plafoniera LED rettangolare 60x60", 36, "8 (Ferromagnetico)", 44, 3600],
  ["-", "Fluorescente Compatta (CFL) Spirale-Globo / E27", 23, "0 (Elettronico integrato)", 23, 1450],
  ["-", "Fluorescente Compatta Pro PL-C Pin / G24q-3", 26, "3 (Elettronico standard)", 29, 1800],
  ["-", "Faretto Incasso Alogeno Dicroico / GU5.3 (12V)", 50, "7 (Trasformatore ferreo)", 57, 680],
  ["-", "Faretto Incasso Alogeno Dicroico / GU10 (230V)", 50, "0 (Alimentazione diretta)", 50, 700],
  ["-", "Faretto Incasso Ioduri Met. Proiettore / Rx7s", 70, "12 (Ferromagnetico)", 82, 6000],
  ["-", "Faretto con lampada alogena 20 W", 20, "0 (Alimentazione diretta)", 20, 200],
  ["-", "Faretto LED da incasso / Downlight", 18, "0 (Alimentazione diretta)", 20, 1600],
  ["-", "Pannello LED 60x60 cm (o 30x120) Entry Level / Retail", 36, "0", 36, 3600],
  ["-", "faretto led da incasso rotondo", 10, "0", 10, 1200],
];

const PROGETTO_LUCI = [
  ["Piano", "TIPOLOGIA APPARECCHIO", "POTENZA NOMINALE (W)", "FLUSSO LUMINOSO (lm)", "EFFICIENZA LUMINOSA (lm/W)", "COMPATIBILITÀ / NOTE TECNICHE"],
  ["-", "Pannello LED 60x60 cm (o 30x120) Entry Level / Retail", 36, 3600, 100, "Di solito UGR <22. Va bene per i corridoi, non per le aule."],
  ["-", "Pannello LED 60x60 cm (o 30x120) Office Professional", 28, 3400, 121, "Standard d'ufficio, solitamente accoppiato a driver UGR <19."],
  ["-", "Pannello LED 60x60 cm (o 30x120) Pro High-Output", 40, 4500, 112, "Spinge sui lumen se hai interassi larghi tra i punti luce."],
  ["-", "Pannello LED 60x60 cm (o 30x120) Top Efficiency (Classe A)", 24, 5040, 210, "Chip di ultima generazione. Costano il doppio, ma TerMus ringrazia."],
  ["-", "Pannello LED 60x60 cm (o 30x120) Industrial High-Flux", 48, 6700, 140, 'Quelli della mia "proposta esagerata" precedente per i 500 lux.'],
  ["-", "Tubo LED T8 60 cm (Attacco G13) Standard Output (SO)", 8, 800, 100, "Sostituisce il vecchio 18W fluorescente. Economico, ma fa poca luce."],
  ["-", "Tubo LED T8 60 cm (Attacco G13) High Output (HO)", 7.6, 1150, 151, "Ottimo compromesso per relamping di qualità."],
  ["-", "Tubo LED T8 60 cm (Attacco G13) Ultra Output (UO)", 8.4, 1350, 160, "Il top di gamma per il 60 cm. Pareggia il flusso del neon tradizionale nuovo."],
  ["-", "Tubo LED T8 120 cm (Attacco G13) Standard Output (SO)", 15, 1800, 120, 'Sostituisce il vecchio 36W fluorescente. Versione "low-cost".'],
  ["-", "Tubo LED T8 120 cm (Attacco G13) High Output (HO)", 18, 2000, 111, "Il tubo più venduto in assoluto per gli uffici e i laboratori."],
  ["-", "Tubo LED T8 120 cm (Attacco G13) Ultra Output (UO)", 15.9, 2550, 160, "Prestazioni elevate. Riduce il carico termico complessivo."],
  ["-", "Tubo LED T8 120 cm (Attacco G13) Ultra Output Premium", 18, 3330, 185, "Flusso massiccio, specifico per uffici ad alta densità o soffitti alti."],
  ["-", "Lampada LED E27 Goccia/Sfera (Standard)", 11, 1055, 96, "Sostituzione diretta per le vecchie compatte a spirale."],
  ["-", "Lampada LED E27 Goccia/Sfera (High Lumen)", 15, 1521, 101, 'Quando la vecchia plafoniera richiede più "spinta".'],
  ["-", "Faretto LED GU5.3 / MR16 (12V)", 5, 345, 69, "Occhio ai trasformatori esistenti, a volte creano sfarfallio (flicker)."],
  ["-", "Faretto LED GU10 (230V)", 5, 395, 79, "La soluzione migliore per rimpiazzare l'alogeno. Tensione di rete diretta."],
  ["-", "Faretto LED GU10 (230V) High-Output", 7, 575, 82, "Se l'alogeno di partenza era un 50W bello pompato."],
  ["-", "Lampada LED Rx7s (Ioduri metallici replacement)", 15, 1800, 120, "Sostituisce il vecchio proiettore da 70W. Va rimosso il reattore/accenditore."],
  ["-", "Faretto LED rotondo da incasso (Downlight) 10W", 10, 1200, 120, "Spesso usati nei bagni o corridoi controsoffittati."],
];

export async function esportaRilievoExcel(idEdificio, tipoExport) {
  try {
    const edificio = await db.edifici.get(idEdificio);
    const ambienti = await db.ambienti.where("id_edificio").equals(idEdificio).toArray();

    if (!edificio) throw new Error("Edificio non trovato");

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "UBIARCHIUM Rilievi";
    workbook.created = new Date();

    const intestazioneForniture = `FABBRICATO: ${edificio.nome.toUpperCase()}   |   POD: ${edificio.pods?.join(", ") || "N/A"}   |   PDR: ${edificio.pdr || "N/A"}`;

    const preparaFoglioConIntestazione = (nomeFoglio, maxColonne) => {
      const ws = workbook.addWorksheet(nomeFoglio);
      const colLettera = String.fromCharCode(65 + maxColonne - 1);
      ws.mergeCells(`A1:${colLettera}1`);
      const cellaM = ws.getCell("A1");
      cellaM.value = intestazioneForniture;
      cellaM.alignment = { horizontal: "center", vertical: "middle" };
      cellaM.font = { bold: true, size: 11, color: { argb: "FF000000" } };
      ws.getRow(1).height = 25;
      ws.addRow([]);
      return ws;
    };

    const isTutto = tipoExport === "tutto";
    const isIllum = isTutto || tipoExport === "illuminazione";
    const isTermi = isTutto || tipoExport === "termico";
    const isInfis = isTutto || tipoExport === "infissi";
    const isAppar = isTutto || tipoExport === "apparecchi";

    if (isIllum) {
      const wsConfronto = preparaFoglioConIntestazione("scheda confronto", 21);

      wsConfronto.mergeCells("A3:M3");
      wsConfronto.getCell("A3").value = "STATO DI FATTO";
      wsConfronto.getCell("A3").alignment = { horizontal: "center", vertical: "middle" };
      wsConfronto.getCell("A3").font = { bold: true };

      wsConfronto.mergeCells("O3:U3");
      wsConfronto.getCell("O3").value = "PROGETTO";
      wsConfronto.getCell("O3").alignment = { horizontal: "center", vertical: "middle" };
      wsConfronto.getCell("O3").font = { bold: true };

      wsConfronto.getCell("B4").value = "dati da rilievo";
      wsConfronto.getCell("O4").value = "Progetto";

      const headerRow = [
        "Piano",
        "Ambiente/Attività",
        "Illuminamento Medio Mantenuto (Em - lux)",
        "Sup. mq",
        "Tipo",
        "N. Punti luce",
        "lampade per punto luce",
        "Quant.",
        "Watt/cad",
        "watt tot.",
        "lumen cad",
        "lumen tot",
        "lux stato di fatto",
        "",
        "Tipo",
        "Quant.",
        "Watt/cad",
        "watt tot.",
        "lumen cad",
        "lumen tot",
        "lux previsti progetto",
      ];
      wsConfronto.addRow(headerRow);
      wsConfronto.getRow(5).font = { bold: true };

      let startRow = 6;
      let lastAmbIllum = null;

      ambienti.forEach((ambiente) => {
        let hasIllum = ambiente.elementi_inseriti?.some((el) => el.categoria === "illuminazione");
        if (hasIllum) {
          if (lastAmbIllum !== null && lastAmbIllum !== ambiente.nome) {
            wsConfronto.addRow([]);
            startRow++;
          }
          lastAmbIllum = ambiente.nome;

          ambiente.elementi_inseriti.forEach((el) => {
            if (el.categoria === "illuminazione") {
              let luxFatto = "";
              if (el.lumen_tot && ambiente.mq && ambiente.mq > 0) {
                luxFatto = Math.round((el.lumen_tot * 0.5 * 0.75) / ambiente.mq);
              }

              const rowData = [
                ambiente.piano || "",
                ambiente.nome,
                ambiente.lux_normativi ? Math.round(ambiente.lux_normativi) : "",
                ambiente.mq || "",
                el.label,
                el.punti_luce ? Math.round(el.punti_luce) : 1,
                el.lampade_per_punto ? Math.round(el.lampade_per_punto) : 1,
                el.quantita ? Math.round(el.quantita) : "",
                el.watt_unitario ? Math.round(el.watt_unitario) : "",
                el.carico_totale_w ? Math.round(el.carico_totale_w) : "",
                el.lumen_cad ? Math.round(el.lumen_cad) : "",
                el.lumen_tot ? Math.round(el.lumen_tot) : "",
                luxFatto,
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
              ];
              wsConfronto.addRow(rowData);

              const rIdx = startRow;
              wsConfronto.getCell(`U${rIdx}`).value = { formula: `IF(ISBLANK(C${rIdx}),"",ROUND(C${rIdx},0))` };
              wsConfronto.getCell(`T${rIdx}`).value = { formula: `IF(OR(ISBLANK(U${rIdx}),ISBLANK(D${rIdx})),"",ROUND((U${rIdx}*D${rIdx})/0.35,0))` };
              wsConfronto.getCell(`S${rIdx}`).value = {
                formula: `IF(ISBLANK(O${rIdx}),"",ROUND(VLOOKUP(O${rIdx},'ILLUMINAZ PROGETTO'!$B$4:$F$100,3,FALSE),0))`,
              };
              wsConfronto.getCell(`Q${rIdx}`).value = {
                formula: `IF(ISBLANK(O${rIdx}),"",ROUND(VLOOKUP(O${rIdx},'ILLUMINAZ PROGETTO'!$B$4:$F$100,2,FALSE),0))`,
              };
              wsConfronto.getCell(`P${rIdx}`).value = { formula: `IF(OR(ISBLANK(T${rIdx}),ISBLANK(S${rIdx}),S${rIdx}=0),"",ROUND(T${rIdx}/S${rIdx},0))` };
              wsConfronto.getCell(`R${rIdx}`).value = { formula: `IF(OR(ISBLANK(P${rIdx}),ISBLANK(Q${rIdx})),"",ROUND(P${rIdx}*Q${rIdx},0))` };

              wsConfronto.getCell(`O${rIdx}`).dataValidation = {
                type: "list",
                allowBlank: true,
                formulae: ["'ILLUMINAZ PROGETTO'!$B$4:$B$100"],
              };

              startRow++;
            }
          });
        }
      });

      wsConfronto.getColumn("A").width = 15;
      wsConfronto.getColumn("B").width = 25;
      wsConfronto.getColumn("E").width = 30;
      wsConfronto.getColumn("O").width = 30;

      const wsReq = preparaFoglioConIntestazione("REQUISITI ILLUMINOTECNICI", 7);
      REQUISITI_ILLUMINOTECNICI.forEach((r) => wsReq.addRow(r));
      wsReq.getRow(3).font = { bold: true };
      wsReq.getColumn("B").width = 40;

      const wsStato = preparaFoglioConIntestazione("ILLUMINAZIONE STATO DI FATTO", 6);
      STATO_DI_FATTO.forEach((r) => wsStato.addRow(r));
      wsStato.getRow(3).font = { bold: true };
      wsStato.getColumn("B").width = 50;

      const wsProgLuci = preparaFoglioConIntestazione("ILLUMINAZ PROGETTO", 6);
      PROGETTO_LUCI.forEach((r) => wsProgLuci.addRow(r));
      wsProgLuci.getRow(3).font = { bold: true };
      wsProgLuci.getColumn("B").width = 60;

      const wsVani = preparaFoglioConIntestazione("Aree Nette Vani", 3);
      wsVani.addRow(["Piano", "VANI", "Area netta [m²]"]);
      wsVani.getRow(3).font = { bold: true };

      ambienti.forEach((amb) => {
        wsVani.addRow([amb.piano || "", amb.nome, amb.mq || 0]);
      });
      wsVani.getColumn("B").width = 35;
    }

    if (isInfis) {
      const wsInfissi = preparaFoglioConIntestazione("Infissi", 6);
      wsInfissi.addRow(["Piano", "Ambiente", "Tipologia Telaio", "Tipo Vetro", "Quantità", "Note / Dimensioni"]);
      wsInfissi.getRow(3).font = { bold: true };

      let lastAmbInfis = null;

      ambienti.forEach((amb) => {
        let hasInfis = amb.elementi_inseriti?.some((el) => el.categoria === "infissi");
        if (hasInfis) {
          if (lastAmbInfis !== null && lastAmbInfis !== amb.nome) {
            wsInfissi.addRow([]);
          }
          lastAmbInfis = amb.nome;

          amb.elementi_inseriti.forEach((el) => {
            if (el.categoria === "infissi") {
              wsInfissi.addRow([amb.piano || "", amb.nome, el.tipologia, el.tipo_vetro, Math.round(el.quantita), el.note || ""]);
            }
          });
        }
      });
      wsInfissi.getColumn("B").width = 25;
      wsInfissi.getColumn("C").width = 25;
      wsInfissi.getColumn("D").width = 30;
    }

    if (isTermi) {
      const wsTermicoRad = preparaFoglioConIntestazione("Termico - Radiatori", 8);
      wsTermicoRad.addRow(["Piano", "Ambiente", "Tipologia", "Dettaglio / Modello", "Watt Unitario", "Elementi / Q.tà", "Carico Totale W", "Note"]);
      wsTermicoRad.getRow(3).font = { bold: true };

      const wsTermicoSplit = preparaFoglioConIntestazione("Termico - Split", 8);
      wsTermicoSplit.addRow(["Piano", "Ambiente", "Tipologia", "Dettaglio / Modello", "Watt Unitario", "Elementi / Q.tà", "Carico Totale W", "Note"]);
      wsTermicoSplit.getRow(3).font = { bold: true };

      let totWRad = 0;
      let totElemRad = 0;
      let countRad = 0;
      let lastAmbRad = null;

      let totWSplit = 0;
      let totQSplit = 0;
      let countSplit = 0;
      let lastAmbSplit = null;

      ambienti.forEach((amb) => {
        let hasRad = amb.elementi_inseriti?.some((el) => el.categoria === "termico" && el.sotto_categoria === "radiatore");
        if (hasRad) {
          if (lastAmbRad !== null && lastAmbRad !== amb.nome) wsTermicoRad.addRow([]);
          lastAmbRad = amb.nome;

          amb.elementi_inseriti.forEach((el) => {
            if (el.categoria === "termico" && el.sotto_categoria === "radiatore") {
              wsTermicoRad.addRow([
                amb.piano || "",
                amb.nome,
                el.sotto_categoria,
                `${el.tipologia} (${el.altezza_label})`,
                el.watt_per_elemento || el.watt_unitario,
                Math.round(el.numero_elementi),
                Math.round(el.carico_totale_w),
                el.note || "",
              ]);
              totWRad += Math.round(el.carico_totale_w || 0);
              totElemRad += Math.round(el.numero_elementi || 0);
              countRad++;
            }
          });
        }

        let hasSplit = amb.elementi_inseriti?.some((el) => el.categoria === "termico" && el.sotto_categoria === "split");
        if (hasSplit) {
          if (lastAmbSplit !== null && lastAmbSplit !== amb.nome) wsTermicoSplit.addRow([]);
          lastAmbSplit = amb.nome;

          amb.elementi_inseriti.forEach((el) => {
            if (el.categoria === "termico" && el.sotto_categoria === "split") {
              wsTermicoSplit.addRow([
                amb.piano || "",
                amb.nome,
                el.sotto_categoria,
                el.label,
                el.watt_unitario,
                Math.round(el.quantita),
                Math.round(el.carico_totale_w),
                el.note || "",
              ]);
              totWSplit += Math.round(el.carico_totale_w || 0);
              totQSplit += Math.round(el.quantita || 0);
              countSplit++;
            }
          });
        }
      });

      wsTermicoRad.addRow([]);
      wsTermicoRad.addRow(["TOTALE GENERALE", "", `N. Radiatori: ${countRad}`, "", "", `Tot. Elementi: ${totElemRad}`, totWRad, ""]);
      wsTermicoRad.getRow(wsTermicoRad.rowCount).font = { bold: true };
      wsTermicoRad.getColumn("B").width = 25;
      wsTermicoRad.getColumn("D").width = 35;

      wsTermicoSplit.addRow([]);
      wsTermicoSplit.addRow(["TOTALE GENERALE", "", `N. Split: ${countSplit}`, "", "", `Tot. Q.tà: ${totQSplit}`, totWSplit, ""]);
      wsTermicoSplit.getRow(wsTermicoSplit.rowCount).font = { bold: true };
      wsTermicoSplit.getColumn("B").width = 25;
      wsTermicoSplit.getColumn("D").width = 35;
    }

    if (isAppar) {
      const wsApparecchi = preparaFoglioConIntestazione("Apparecchiature", 7);
      wsApparecchi.addRow(["Piano", "Ambiente", "Dettaglio Apparecchio", "Watt Unitario", "Quantità", "Carico Totale W", "Note"]);
      wsApparecchi.getRow(3).font = { bold: true };

      let totWApparecchi = 0;
      let lastAmbAppar = null;

      ambienti.forEach((amb) => {
        let hasAppar = amb.elementi_inseriti?.some((el) => el.categoria === "apparecchio");
        if (hasAppar) {
          if (lastAmbAppar !== null && lastAmbAppar !== amb.nome) {
            wsApparecchi.addRow([]);
          }
          lastAmbAppar = amb.nome;

          amb.elementi_inseriti.forEach((el) => {
            if (el.categoria === "apparecchio") {
              wsApparecchi.addRow([
                amb.piano || "",
                amb.nome,
                el.label,
                Math.round(el.watt_unitario),
                Math.round(el.quantita),
                Math.round(el.carico_totale_w),
                el.note || "",
              ]);
              totWApparecchi += Math.round(el.carico_totale_w || 0);
            }
          });
        }
      });

      wsApparecchi.addRow([]);
      wsApparecchi.addRow(["TOTALE GENERALE", "", "", "", "", totWApparecchi, ""]);
      wsApparecchi.getRow(wsApparecchi.rowCount).font = { bold: true };
      wsApparecchi.getColumn("B").width = 25;
      wsApparecchi.getColumn("C").width = 35;
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });

    let suffisso = tipoExport.toUpperCase();
    if (tipoExport === "tutto") suffisso = "COMPLETO";

    const nomeFile = `Rilievo_${edificio.nome.replace(/\s+/g, "_")}_${suffisso}.xlsx`;
    saveAs(blob, nomeFile);
  } catch (error) {
    alert("Errore nell'esportazione excel.");
  }
}
