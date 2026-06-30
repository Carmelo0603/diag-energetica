import { db } from '../db/database';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

// === NUOVE TABELLE NORMATIVE ===
const REQUISITI_SCUOLE = [
  ["Tabella Requisiti Illuminotecnici — Edifici Scolastici", "", "", "", "", ""],
  ["Ambiente / Attività", "Illuminamento Medio Mantenuto (Em - lux)", "Limite di Abbagliamento (UGRL)", "Indice Resa Cromatica Minima (Ra)", "Riferimento Normativo Principale", "Note di Progetto / Prescrizioni"],
  ["Aule d'infanzia / Asili nido", 300, 19, 80, "UNI EN 12464-1:2021", "Evitare abbagliamento diretto sui tappeti di gioco."],
  ["Aule di lezione diurne (Scuole di ogni ordine e grado)", 300, 19, 80, "UNI EN 12464-1:2021 / UNI 10840", "Illuminamento sul piano di lavoro orizzontale (h = 0,85 m)."],
  ["Aule per corsi serali e istruzione adulti", 500, 19, 80, "UNI EN 12464-1:2021", "Livello incrementato per compensare la mancanza di luce naturale."],
  ["Aule di disegno tecnico", 750, 16, 80, "UNI EN 12464-1:2021 / UNI 10840", "Requisito stringente sull'abbagliamento (UGR max 16)."],
  ["Aule di disegno e arte (Scuole d'arte)", 500, 19, 90, "UNI EN 12464-1:2021", "Ra minimo 90 per garantire la corretta percezione del colore."],
  ["Laboratori scientifici e officine", 500, 19, 80, "UNI EN 12464-1:2021", "Attenzione alla sicurezza d'uso delle macchine utensili."],
  ["Aule informatiche e laboratori linguistici", 300, 19, 80, "UNI EN 12464-1:2021 / D.Lgs. 81/08", "Schermatura idonea per prevenire riflessi sui videoterminali."],
  ["Sale musica e aule di pratica musicale", 300, 18, 80, "UNI EN 12464-1:2021", "UGR massimo restrittivo (18) per agevolare la lettura del pentagramma."],
  ["Biblioteche: sale di lettura", 500, 19, 80, "UNI EN 12464-1:2021", "Illuminamento sul piano orizzontale di lettura."],
  ["Biblioteche: zone scaffalature", 200, 19, 80, "UNI EN 12464-1:2021", "Valore sui piani verticali dei dorsi dei libri."],
  ["Palestre e campi da gioco interni", 300, 22, 80, "UNI EN 12464-1:2021 / EN 12193", "Per competizioni agonistiche fare riferimento alla EN 12193 (fino a 500 lx)."],
  ["Atri, ingressi principali e zone accoglienza", 200, 22, 80, "UNI EN 12464-1:2021", "Zona di transizione per l'adattamento visivo tra esterno e interno."],
  ["Corridoi e aree di circolazione generali", 100, 25, 80, "UNI EN 12464-1:2021", "Misurato a livello del pavimento. Elevabile a 150 lx in caso di percorsi critici."],
  ["Scale, rampe e passaggi pedonali", 150, 25, 80, "UNI EN 12464-1:2021", "Richiesto un contrasto marcato sui bordi dei gradini."],
  ["Servizi igienici e antibagni", 200, 25, 80, "UNI EN 12464-1:2021", "Garantire comunque un livello minimo di sicurezza e igiene visiva."],
  ["Uffici, Presidenza e Sala professori", 500, 19, 80, "UNI EN 12464-1:2021 / D.Lgs. 81/08", "Stessi identici parametri di un ufficio commerciale standard."],
  ["Infermeria e locali di primo soccorso", 500, 19, 90, "UNI EN 12464-1:2021", "Ra minimo 90 per l'ispezione medica e primo intervento."],
  ["Mense scolastiche e refettori", 200, 22, 80, "UNI EN 12464-1:2021", "Comfort visivo legato alla socializzazione e al consumo pasti."]
];

const REQUISITI_UFFICI = [
  ["Tabella Requisiti Illuminotecnici — UFFICI", "", "", "", "", ""],
  ["Ambiente / Attività", "Illuminamento Medio Mantenuto (Em - lux)", "Limite di Abbagliamento (UGRL)", "Indice Resa Cromatica Minima (Ra)", "Riferimento Normativo Principale", "Note di Progetto / Prescrizioni"],
  ["Archivi (consultazione rara)", 200, 25, 80, "UNI EN 12464-1", "Illuminazione funzionale per individuazione rapida."],
  ["Corridoi e aree transito", 100, 25, 80, "UNI EN 12464-1", "Garantire contrasto per identificare ostacoli."],
  ["Uffici singoli / Open space", 500, 19, 80, "UNI EN 12464-1", "Limitare l'abbagliamento riflesso sugli schermi."],
  ["Sale riunioni e conferenze", 500, 19, 80, "UNI EN 12464-1", "Consigliata dimmerazione per presentazioni AV."],
  ["Reception / Accoglienza", 300, 19, 80, "UNI EN 12464-1", "Importante l'aspetto estetico e di comfort."],
  ["Sale ristoro / Break area", 200, 22, 80, "UNI EN 12464-1", "Atmosfera rilassante, stacco visivo dall'ufficio."],
  ["Locali fotocopiatrici / Stampa", 300, 19, 80, "UNI EN 12464-1", "Illuminamento uniforme sul piano di lavoro."],
  ["Ufficio disegno tecnico / CAD", 750, 16, 80, "UNI EN 12464-1", "Requisito stringente sull'abbagliamento (UGR max 16)."],
  ["Archivio (consultazione intensa)", 300, 19, 80, "UNI EN 12464-1", "Migliore leggibilità delle etichette e documenti."]
];

const REQUISITI_CASA_RIPOSO = [
  ["Tabella Requisiti Illuminotecnici — CASA DI RIPOSO", "", "", "", "", ""],
  ["Ambiente / Attività", "Illuminamento Medio Mantenuto (Em - lux)", "Limite di Abbagliamento (UGRL)", "Indice Resa Cromatica Minima (Ra)", "Riferimento Normativo Principale", "Note di Progetto / Prescrizioni"],
  ["Ingressi e reception", 300, 19, 80, "UNI EN 12464-1", "Necessaria zona di transizione (adattamento)."],
  ["Corridoi e percorsi", 200, 19, 80, "UNI EN 12464-1", "Illuminazione costante, evitare effetti stroboscopici."],
  ["Scale e rampe", 200, 19, 80, "UNI EN 12464-1", "Contrasto elevato sui bordi dei gradini."],
  ["Camere di degenza", 100, 19, 80, "UNI EN 12464-1", "Luce calda, dimmerabile per ciclo circadiano."],
  ["Zona lettura in camera", 300, 19, 80, "UNI EN 12464-1", "Luce localizzata priva di abbagliamento."],
  ["Bagni (degenza)", 300, 22, 80, "UNI EN 12464-1", "Illuminazione uniforme, luce specchio priva di ombre."],
  ["Sale comuni / TV", 200, 19, 80, "UNI EN 12464-1", "Luce indiretta per evitare riflessi su schermi."],
  ["Sale da pranzo", 300, 19, 80, "UNI EN 12464-1", "Ra alto per migliore riconoscimento dei cibi."],
  ["Ambulatorio / Infermeria", 500, 16, 90, "UNI EN 12464-1", "Ra min 90 per corretta diagnosi visiva."],
  ["Fisioterapia / Palestra", 300, 19, 80, "UNI EN 12464-1", "Illuminamento uniforme per attività motoria."],
  ["Cappella / Area relax", 150, 19, 80, "UNI EN 12464-1", "Atmosfera raccolta, luce d'accento."],
  ["Locali tecnici / lavanderia", 300, 22, 80, "UNI EN 12464-1", "Illuminazione funzionale ad alto contrasto."]
];

const REQUISITI_RESIDENZIALE = [
  ["Tabella Requisiti Illuminotecnici — RESIDENZIALE", "", "", "", "", ""],
  ["Ambiente / Attività", "Illuminamento Medio Mantenuto (Em - lux)", "Limite di Abbagliamento (UGRL)", "Indice Resa Cromatica Minima (Ra)", "Riferimento Normativo Principale", "Note di Progetto / Prescrizioni"],
  ["Ingressi ", 100, 22, 80, "UNI EN 12464-1", "Illuminamento diffuso, evitare ombre nette."],
  ["Corridoio", 100, 22, 80, "UNI EN 12464-2", "Illuminamento diffuso, evitare ombre nette."],
  ["Scala", 150, 25, 80, "UNI EN 12464-1", "Contrasto marcato sui bordi dei gradini."],
  ["Soggiorno / Living", 200, 22, 80, "UNI EN 12464-1", "Scenari dinamici (dimmerazione) consigliati."],
  ["Cucina", 300, 22, 80, "UNI EN 12464-1", "Luce mirata sul piano di lavoro (top)."],
  ["Camera da letto", 300, 19, 80, "UNI EN 12464-1", "Luce d'atmosfera, preferibilmente calda."],
  ["Bagno", 200, 25, 80, "UNI EN 12464-1", "Luce specchio per evitare ombre sul volto."],
  ["Studio / Home Office", 500, 19, 80, "UNI EN 12464-1", "Parametri ufficio, evitare riflessi su schermi."],
  ["Ripostiglio", 100, 25, 80, "UNI EN 12464-1", "Illuminazione funzionale, accensione rapida."],
  ["Garage", 200, 22, 80, "UNI EN 12464-1", "Illuminazione funzionale, accensione rapida."],
  ["Cantina", 200, 22, 80, "UNI EN 12464-1", "Illuminazione funzionale, accensione rapida."],
  ["Sottotetto", 200, 22, 80, "UNI EN 12464-1", "Illuminazione funzionale, accensione rapida."]
];

const STATO_DI_FATTO = [
  ["CATEGORIA", "POTENZA LAMPADA (W)", "PERDITE ALIMENTATORE (W)", "POTENZA REALE ASSORBITA (W)", "FLUSSO LUMINOSO NOMINALE (lm)"],
  ["Applique LED da parete per uscite di sicurezza", 12, "", "", 1000],
  ["Applique a parete a neon 30W + reattore", 38, "", "", 2400],
  ["Faretto LED da incasso / Downlight", 18, "", "", 1600],
  ["Lampada d'emergenza LED (In fase di ricarica costante)", 5, "", "", 300],
  ["Lampada LED industriale a sospensione / Campana (Per palestre)", 100, "", "", 13000],
  ["Plafoniera LED rettangolare 120x30 cm", 40, "", "", 4000],
  ["Plafoniera LED rettangolare 60x60 cm", 36, "", "", 3600],
  ["Plafoniera stagna LED per corridoi e servizi", 30, "", "", 3300],
  ["Proiettore LED da esterno per cortili o accessi", 50, "", "", 5500],
  ["Tubo fluorescente neon da 120 cm (Standard T8) + reattore", 45, "", "", 3000],
  ["Tubo fluorescente neon da 60 cm (Standard T8) + reattore", 23, "", "", 1350]
];

const PROGETTO_LUCI = [
  ["TIPOLOGIA APPARECCHIO", "POTENZA NOMINALE (W)", "FLUSSO LUMINOSO (lm)", "EFFICIENZA LUMINOSA (lm/W)", "modello/produttore"],
  ["Pannello LED 60x60 3400 lm", 28, 3400, 121, "Noxion LED Panel Ecowhite V4.0 28W 3400lm 4000K 600X600 UGR<19"],
  ["Pannello LED 60x60 3600 lm", 36, 3600, 121, "White label LED Panel V2 Backlit 36W 3600lm 6500K 600X600 UGR22"],
  ["Pannello LED 60x60 4300 lm", 31, 4300, 130, "PHILIPS - Modello CoreLine Panel RC132V. Flusso maggiorato."],
  ["Pannello LED 60x60 4815 lm", 30, 4815, 210, "Interlight Thinq Next+ led paneel 30W UGR<19"],
  ["Pannello LED 30x120 3360 lm", 28, 3360, 140, "Noxion LED Panel Ecowhite V4.0 28W"],
  ["Tubo LED T8 120 cm (Attacco G13) 3500 lm", 29, 3500, 120, "Ledvance Tubo LED T8 EM Value Ultra Output 29W 3500lm"],
  ["Tubo LED T8 150 cm (Attacco G13) 4100 lm", 22.1, 4100, 186, "Noxion Avant LEDtube T8 Ultra Output UE 1500 22.1W"],
  ["Faretto LED GU4 MR11 (Spot 35mm) - dicroico 184 lm", 2.3, 184, 80, "PHILIPS - Modello CorePro LEDspot LV."],
  ["Faretto LED GU10 / MR16 (Spot 50mm) 550 lm", 4.9, 550, 112, "LEDVANCE (OSRAM) - Modello Performance LED SPOT GU10."]
];

function calcolaProgettoMigliore(luxNormativi, mq, puntiLuce) {
  if (!luxNormativi || !mq || !puntiLuce) return { tipo: "", qty: "" };

  const reqLumenTot = (luxNormativi * mq) / 0.375;
  const reqLumenPerPunto = reqLumenTot / puntiLuce;

  const lampadeDisponibili = PROGETTO_LUCI.slice(1).map(row => ({
    nome: row[0],
    lumen: row[2]
  })).filter(l => typeof l.lumen === 'number' && l.lumen > 0)
      .sort((a, b) => a.lumen - b.lumen);

  if (lampadeDisponibili.length === 0) return { tipo: "", qty: "" };

  for (let qty = 1; qty <= 6; qty++) {
    for (let lamp of lampadeDisponibili) {
      if ((lamp.lumen * qty) >= reqLumenPerPunto) {
        return { tipo: lamp.nome, qty: qty };
      }
    }
  }

  const lampadaMax = lampadeDisponibili[lampadeDisponibili.length - 1];
  return { tipo: lampadaMax.nome, qty: 6 };
}

export async function esportaRilievoExcel(idEdificio, tipoExport) {
  try {
    const edificio = await db.edifici.get(idEdificio);
    const ambienti = await db.ambienti.where('id_edificio').equals(idEdificio).toArray();

    if (!edificio) throw new Error("Edificio non trovato");

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'UBIARCHIUM Rilievi';
    workbook.created = new Date();

    const intestazioneForniture = `FABBRICATO: ${edificio.nome.toUpperCase()}   |   POD: ${edificio.pods?.join(', ') || 'N/A'}   |   PDR: ${edificio.pdr || 'N/A'}`;

    const preparaFoglioConIntestazione = (nomeFoglio, maxColonne) => {
      const ws = workbook.addWorksheet(nomeFoglio);
      const colLettera = String.fromCharCode(65 + maxColonne - 1);
      ws.mergeCells(`A1:${colLettera}1`);
      const cellaM = ws.getCell('A1');
      cellaM.value = intestazioneForniture;
      cellaM.alignment = { horizontal: 'center', vertical: 'middle' };
      cellaM.font = { bold: true, size: 11, color: { argb: 'FF000000' } };
      ws.getRow(1).height = 25;
      ws.addRow([]);
      return ws;
    };

    const isTutto = tipoExport === 'tutto';
    const isIllum = isTutto || tipoExport === 'illuminazione';
    const isTermi = isTutto || tipoExport === 'termico';
    const isInfis = isTutto || tipoExport === 'infissi';
    const isAppar = isTutto || tipoExport === 'apparecchi';
    const isElettrico = isTutto || tipoExport === 'elettrico';

    // Seleziona la tabella requisiti corretta in base alla categoria dell'edificio
    let tabellaRequisitiAttiva = REQUISITI_SCUOLE; // Fallback
    const macroCat = edificio.macro_categoria?.toLowerCase() || '';
    if (macroCat === 'ufficio') {
      tabellaRequisitiAttiva = REQUISITI_UFFICI;
    } else if (macroCat === 'residenziale' || macroCat === 'condominio') {
      tabellaRequisitiAttiva = REQUISITI_RESIDENZIALE;
    } else if (macroCat === 'casa_riposo') {
      tabellaRequisitiAttiva = REQUISITI_CASA_RIPOSO;
    }

    if (isIllum) {
      const wsConfronto = preparaFoglioConIntestazione('CALCOLO ILLUMINAZIONE', 25);

      wsConfronto.mergeCells('A3:M3');
      wsConfronto.getCell('A3').value = 'Stato di fatto';
      wsConfronto.getCell('A3').alignment = { horizontal: 'center', vertical: 'middle' };
      wsConfronto.getCell('A3').font = { bold: true };

      wsConfronto.mergeCells('O3:Y3');
      wsConfronto.getCell('O3').value = 'Progetto';
      wsConfronto.getCell('O3').alignment = { horizontal: 'center', vertical: 'middle' };
      wsConfronto.getCell('O3').font = { bold: true };

      const headerRow = [
        "Piano", "Ambiente/Attività", "Illuminamento Medio lux", "Sup. mq", "Tipo", "N. Punti luce", "lampade per punto luce", "Tot. Lampade", "Watt/cad", "watt tot.", "lumen cad", "lumen tot", "lux tot. stato di fatto",
        "",
        "Tipo", "N. Punti luce", "lampade per punto luce", "Tot. lampade progetto", "Watt/cad", "watt tot.", "lumen cad", "Lumen totali", "Lux totali PROGETTO", "Verifica", "lux previsti da norma"
      ];
      wsConfronto.addRow(headerRow);
      wsConfronto.getRow(4).font = { bold: true };

      let startRow = 5;

      ambienti.forEach(ambiente => {
        let hasIllum = ambiente.elementi_inseriti?.some(el => el.categoria === 'illuminazione');

        if (hasIllum) {
          ambiente.elementi_inseriti.forEach(el => {
            if (el.categoria === 'illuminazione') {
              const luxNorm = ambiente.lux_normativi ? Math.round(ambiente.lux_normativi) : "";
              const pLuce = el.punti_luce ? Math.round(el.punti_luce) : 1;

              const { tipo: tipoProg, qty: qtyProg } = calcolaProgettoMigliore(luxNorm, ambiente.mq, pLuce);

              const rIdx = startRow;

              wsConfronto.getCell(`A${rIdx}`).value = ambiente.piano || "-";
              wsConfronto.getCell(`B${rIdx}`).value = ambiente.nome;
              wsConfronto.getCell(`C${rIdx}`).value = luxNorm;
              wsConfronto.getCell(`D${rIdx}`).value = ambiente.mq || "";
              wsConfronto.getCell(`E${rIdx}`).value = el.label;
              wsConfronto.getCell(`F${rIdx}`).value = pLuce;
              wsConfronto.getCell(`G${rIdx}`).value = el.lampade_per_punto ? Math.round(el.lampade_per_punto) : 1;
              wsConfronto.getCell(`H${rIdx}`).value = { formula: `F${rIdx}*G${rIdx}` };
              wsConfronto.getCell(`I${rIdx}`).value = el.watt_unitario ? Math.round(el.watt_unitario) : "";
              wsConfronto.getCell(`J${rIdx}`).value = { formula: `H${rIdx}*I${rIdx}` };
              wsConfronto.getCell(`K${rIdx}`).value = el.lumen_cad ? Math.round(el.lumen_cad) : "";
              wsConfronto.getCell(`L${rIdx}`).value = { formula: `H${rIdx}*K${rIdx}` };
              wsConfronto.getCell(`M${rIdx}`).value = { formula: `IF(ISBLANK(D${rIdx}),"",ROUND((L${rIdx}*0.375)/D${rIdx},0))` };

              wsConfronto.getCell(`N${rIdx}`).value = "";

              wsConfronto.getCell(`O${rIdx}`).value = tipoProg;
              wsConfronto.getCell(`O${rIdx}`).dataValidation = { type: 'list', allowBlank: true, formulae: ['\'ILLUMINAZ PROGETTO\'!$A$2:$A$100'] };

              wsConfronto.getCell(`P${rIdx}`).value = { formula: `F${rIdx}` };
              wsConfronto.getCell(`Q${rIdx}`).value = qtyProg;
              wsConfronto.getCell(`R${rIdx}`).value = { formula: `P${rIdx}*Q${rIdx}` };
              wsConfronto.getCell(`S${rIdx}`).value = { formula: `IF(ISBLANK(O${rIdx}),"",VLOOKUP(O${rIdx},'ILLUMINAZ PROGETTO'!$A$2:$E$100,2,FALSE))` };
              wsConfronto.getCell(`T${rIdx}`).value = { formula: `IF(ISBLANK(S${rIdx}),"",R${rIdx}*S${rIdx})` };
              wsConfronto.getCell(`U${rIdx}`).value = { formula: `IF(ISBLANK(O${rIdx}),"",VLOOKUP(O${rIdx},'ILLUMINAZ PROGETTO'!$A$2:$E$100,3,FALSE))` };
              wsConfronto.getCell(`V${rIdx}`).value = { formula: `IF(ISBLANK(U${rIdx}),"",R${rIdx}*U${rIdx})` };
              wsConfronto.getCell(`W${rIdx}`).value = { formula: `IF(OR(ISBLANK(D${rIdx}),ISBLANK(V${rIdx})),"",ROUND((V${rIdx}*0.375)/D${rIdx},0))` };
              wsConfronto.getCell(`X${rIdx}`).value = { formula: `IF(ISBLANK(W${rIdx}),"",IF(W${rIdx}>=Y${rIdx},"OK","NO"))` };
              wsConfronto.getCell(`Y${rIdx}`).value = { formula: `C${rIdx}` };

              startRow++;
            }
          });
        }
      });

      wsConfronto.getColumn('B').width = 25;
      wsConfronto.getColumn('E').width = 40;
      wsConfronto.getColumn('O').width = 40;

      // Popola in modo dinamico con la tabella del cantiere corretto
      const wsReq = preparaFoglioConIntestazione('REQUISITI ILLUMINOTECNICI', 6);
      tabellaRequisitiAttiva.forEach((r, idx) => {
        wsReq.addRow(r);
        if(idx === 0) wsReq.mergeCells(`A${wsReq.rowCount}:F${wsReq.rowCount}`);
      });
      wsReq.getRow(3).font = { bold: true, size: 12 };
      wsReq.getRow(4).font = { bold: true };
      wsReq.getColumn('A').width = 40;

      const wsStato = preparaFoglioConIntestazione('ILLUMINAZIONE STATO DI FATTO', 5);
      STATO_DI_FATTO.forEach(r => wsStato.addRow(r));
      wsStato.getRow(3).font = { bold: true };
      wsStato.getColumn('A').width = 50;

      const wsProgLuci = preparaFoglioConIntestazione('ILLUMINAZ PROGETTO', 5);
      PROGETTO_LUCI.forEach(r => wsProgLuci.addRow(r));
      wsProgLuci.getRow(3).font = { bold: true };
      wsProgLuci.getColumn('A').width = 60;

      const wsVani = preparaFoglioConIntestazione('Aree Nette Vani', 3);
      wsVani.addRow(['Piano', 'VANI', 'Area netta [m²]']);
      wsVani.getRow(3).font = { bold: true };

      ambienti.forEach(amb => wsVani.addRow([amb.piano || "", amb.nome, amb.mq || 0]));
      wsVani.getColumn('B').width = 35;
    }

    if (isInfis) {
      const wsInfissi = preparaFoglioConIntestazione('Infissi', 6);
      wsInfissi.addRow(["Piano", "Ambiente", "Tipologia Telaio", "Tipo Vetro", "Quantità", "Note / Dimensioni"]);
      wsInfissi.getRow(3).font = { bold: true };

      let lastAmbInfis = null;

      ambienti.forEach(amb => {
        let hasInfis = amb.elementi_inseriti?.some(el => el.categoria === 'infissi');
        if (hasInfis) {
          if (lastAmbInfis !== null && lastAmbInfis !== amb.nome) wsInfissi.addRow([]);
          lastAmbInfis = amb.nome;
          amb.elementi_inseriti.forEach(el => {
            if (el.categoria === 'infissi') {
              wsInfissi.addRow([amb.piano || "", amb.nome, el.tipologia, el.tipo_vetro, Math.round(el.quantita), el.note || ""]);
            }
          });
        }
      });
      wsInfissi.getColumn('B').width = 25;
      wsInfissi.getColumn('C').width = 25;
      wsInfissi.getColumn('D').width = 30;
    }

    if (isTermi) {
      const wsTermicoRad = preparaFoglioConIntestazione('Termico - Radiatori', 8);
      wsTermicoRad.addRow(["Piano", "Ambiente", "Tipologia", "Dettaglio / Modello", "Watt Unitario", "Elementi", "Carico Totale W", "Note"]);
      wsTermicoRad.getRow(3).font = { bold: true };

      const wsTermicoSplit = preparaFoglioConIntestazione('Termico - Split', 8);
      wsTermicoSplit.addRow(["Piano", "Ambiente", "Tipologia", "Dettaglio / Modello", "Watt Unitario", "Q.tà", "Carico Totale W", "Note"]);
      wsTermicoSplit.getRow(3).font = { bold: true };

      const wsFancoil = preparaFoglioConIntestazione('Termico - Fancoil', 8);
      wsFancoil.addRow(["Piano", "Ambiente", "Marca", "Modello", "Pot. Risc. (W)", "Pot. Raff. (W)", "Q.tà", "Note"]);
      wsFancoil.getRow(3).font = { bold: true };

      const wsCanalizzato = preparaFoglioConIntestazione('Termico - Canalizzato', 4);
      wsCanalizzato.addRow(["Piano", "Ambiente", "Potenza Macchina (W)", "Note"]);
      wsCanalizzato.getRow(3).font = { bold: true };

      const wsPavimentoRad = preparaFoglioConIntestazione('Termico - Pav. Radiante', 7);
      wsPavimentoRad.addRow(["Piano", "Ambiente", "Marca", "Modello", "Superficie (mq)", "Passo Posa", "Note"]);
      wsPavimentoRad.getRow(3).font = { bold: true };

      const wsSoffittoRad = preparaFoglioConIntestazione('Termico - Soff. Radiante', 7);
      wsSoffittoRad.addRow(["Piano", "Ambiente", "Marca", "Modello", "Superficie (mq)", "Passo Posa", "Note"]);
      wsSoffittoRad.getRow(3).font = { bold: true };

      let totWRad = 0; let totElemRad = 0; let countRad = 0; let lastAmbRad = null;
      let totWSplit = 0; let totQSplit = 0; let countSplit = 0; let lastAmbSplit = null;
      let countFancoil = 0; let lastAmbFancoil = null;
      let countCanal = 0; let lastAmbCanal = null;
      let countPavRad = 0; let lastAmbPavRad = null;
      let countSofRad = 0; let lastAmbSofRad = null;

      ambienti.forEach(amb => {
        const insertSpazio = (sottoCat, nome) => {
          if(sottoCat === 'radiatore') { if (lastAmbRad !== null && lastAmbRad !== nome) wsTermicoRad.addRow([]); lastAmbRad = nome; }
          else if(sottoCat === 'split') { if (lastAmbSplit !== null && lastAmbSplit !== nome) wsTermicoSplit.addRow([]); lastAmbSplit = nome; }
          else if(sottoCat === 'fancoil') { if (lastAmbFancoil !== null && lastAmbFancoil !== nome) wsFancoil.addRow([]); lastAmbFancoil = nome; }
          else if(sottoCat === 'canalizzato') { if (lastAmbCanal !== null && lastAmbCanal !== nome) wsCanalizzato.addRow([]); lastAmbCanal = nome; }
          else if(sottoCat === 'pavimento_radiante') { if (lastAmbPavRad !== null && lastAmbPavRad !== nome) wsPavimentoRad.addRow([]); lastAmbPavRad = nome; }
          else if(sottoCat === 'soffitto_radiante') { if (lastAmbSofRad !== null && lastAmbSofRad !== nome) wsSoffittoRad.addRow([]); lastAmbSofRad = nome; }
        };

        amb.elementi_inseriti?.forEach(el => {
          if (el.categoria === 'termico') {
            insertSpazio(el.sotto_categoria, amb.nome);

            if (el.sotto_categoria === 'radiatore') {
              wsTermicoRad.addRow([amb.piano || "", amb.nome, el.sotto_categoria, `${el.tipologia} (${el.altezza_label})`, el.watt_per_elemento || el.watt_unitario, Math.round(el.numero_elementi), Math.round(el.carico_totale_w), el.note || ""]);
              totWRad += Math.round(el.carico_totale_w || 0);
              totElemRad += Math.round(el.numero_elementi || 0);
              countRad++;
            } else if (el.sotto_categoria === 'split') {
              wsTermicoSplit.addRow([amb.piano || "", amb.nome, el.sotto_categoria, el.label, el.watt_unitario, Math.round(el.quantita), Math.round(el.carico_totale_w), el.note || ""]);
              totWSplit += Math.round(el.carico_totale_w || 0);
              totQSplit += Math.round(el.quantita || 0);
              countSplit++;
            } else if (el.sotto_categoria === 'fancoil') {
              wsFancoil.addRow([amb.piano || "", amb.nome, el.marca, el.modello, el.potenza_risc, el.potenza_raff, el.quantita, el.note || ""]);
              countFancoil++;
            } else if (el.sotto_categoria === 'canalizzato') {
              wsCanalizzato.addRow([amb.piano || "", amb.nome, el.potenza_macchina, el.note || ""]);
              countCanal++;
            } else if (el.sotto_categoria === 'pavimento_radiante') {
              wsPavimentoRad.addRow([amb.piano || "", amb.nome, el.marca, el.modello, el.superficie, el.passo_posa, el.note || ""]);
              countPavRad++;
            } else if (el.sotto_categoria === 'soffitto_radiante') {
              wsSoffittoRad.addRow([amb.piano || "", amb.nome, el.marca, el.modello, el.superficie, el.passo_posa, el.note || ""]);
              countSofRad++;
            }
          }
        });
      });

      if (countRad > 0) {
        wsTermicoRad.addRow([]);
        wsTermicoRad.addRow(["TOTALE GENERALE", "", `N. Radiatori: ${countRad}`, "", "", `Tot. Elementi: ${totElemRad}`, totWRad, ""]);
        wsTermicoRad.getRow(wsTermicoRad.rowCount).font = { bold: true };
      }
      if (countSplit > 0) {
        wsTermicoSplit.addRow([]);
        wsTermicoSplit.addRow(["TOTALE GENERALE", "", `N. Split: ${countSplit}`, "", "", `Tot. Q.tà: ${totQSplit}`, totWSplit, ""]);
        wsTermicoSplit.getRow(wsTermicoSplit.rowCount).font = { bold: true };
      }

      wsTermicoRad.getColumn('B').width = 25; wsTermicoRad.getColumn('D').width = 35;
      wsTermicoSplit.getColumn('B').width = 25; wsTermicoSplit.getColumn('D').width = 35;
      wsFancoil.getColumn('B').width = 25; wsFancoil.getColumn('C').width = 25; wsFancoil.getColumn('D').width = 25;
      wsCanalizzato.getColumn('B').width = 25; wsCanalizzato.getColumn('C').width = 25;
      wsPavimentoRad.getColumn('B').width = 25; wsPavimentoRad.getColumn('C').width = 25; wsPavimentoRad.getColumn('D').width = 25;
      wsSoffittoRad.getColumn('B').width = 25; wsSoffittoRad.getColumn('C').width = 25; wsSoffittoRad.getColumn('D').width = 25;
    }

    if (isAppar) {
      const wsApparecchi = preparaFoglioConIntestazione('Apparecchiature', 7);
      wsApparecchi.addRow(["Piano", "Ambiente", "Dettaglio Apparecchio", "Watt Unitario", "Quantità", "Carico Totale W", "Note"]);
      wsApparecchi.getRow(3).font = { bold: true };

      let totWApparecchi = 0; let lastAmbAppar = null;

      ambienti.forEach(amb => {
        let hasAppar = amb.elementi_inseriti?.some(el => el.categoria === 'apparecchio');
        if (hasAppar) {
          if (lastAmbAppar !== null && lastAmbAppar !== amb.nome) wsApparecchi.addRow([]);
          lastAmbAppar = amb.nome;
          amb.elementi_inseriti.forEach(el => {
            if (el.categoria === 'apparecchio') {
              wsApparecchi.addRow([amb.piano || "", amb.nome, el.label, Math.round(el.watt_unitario), Math.round(el.quantita), Math.round(el.carico_totale_w), el.note || ""]);
              totWApparecchi += Math.round(el.carico_totale_w || 0);
            }
          });
        }
      });

      wsApparecchi.addRow([]);
      wsApparecchi.addRow(["TOTALE GENERALE", "", "", "", "", totWApparecchi, ""]);
      wsApparecchi.getRow(wsApparecchi.rowCount).font = { bold: true };
      wsApparecchi.getColumn('B').width = 25;
      wsApparecchi.getColumn('C').width = 35;
    }

    if (isElettrico) {
      const wsRiepilogoFatto = preparaFoglioConIntestazione('Riep. elettrico Stato di fatto', 5);
      wsRiepilogoFatto.addRow(["Piano", "Ambiente", "Totale Watt Illuminazione", "Totale Watt Apparecchi", "Potenza Elettrica Totale (W)"]);
      wsRiepilogoFatto.getRow(3).font = { bold: true };

      const wsRiepilogoProg = preparaFoglioConIntestazione('Riep. elettrico Stato Prog.', 5);
      wsRiepilogoProg.addRow(["Piano", "Ambiente", "Totale Watt Illum. Progetto", "Totale Watt Apparecchi", "Potenza Elettrica Totale (W)"]);
      wsRiepilogoProg.getRow(3).font = { bold: true };

      let granTotaleIllumFatto = 0;
      let granTotaleIllumProg = 0;
      let granTotaleAppar = 0;

      ambienti.forEach(amb => {
        let sumIllumFatto = 0;
        let sumIllumProg = 0;
        let sumAppar = 0;

        amb.elementi_inseriti?.forEach(el => {
          if (el.categoria === 'illuminazione') {
            sumIllumFatto += Math.round(el.carico_totale_w || 0);

            const luxNorm = amb.lux_normativi ? Math.round(amb.lux_normativi) : 0;
            const pLuce = el.punti_luce ? Math.round(el.punti_luce) : 1;
            const { tipo: tipoProg, qty: qtyProg } = calcolaProgettoMigliore(luxNorm, amb.mq, pLuce);

            const lampadaTrovata = PROGETTO_LUCI.find(r => r[0] === tipoProg);
            const wattCadProg = lampadaTrovata ? lampadaTrovata[1] : 0;

            sumIllumProg += Math.round(pLuce * qtyProg * wattCadProg);

          } else if (el.categoria === 'apparecchio') {
            sumAppar += Math.round(el.carico_totale_w || 0);
          }
        });

        if (sumIllumFatto > 0 || sumAppar > 0 || sumIllumProg > 0) {
          wsRiepilogoFatto.addRow([amb.piano || "", amb.nome, sumIllumFatto, sumAppar, sumIllumFatto + sumAppar]);
          wsRiepilogoProg.addRow([amb.piano || "", amb.nome, sumIllumProg, sumAppar, sumIllumProg + sumAppar]);

          granTotaleIllumFatto += sumIllumFatto;
          granTotaleIllumProg += sumIllumProg;
          granTotaleAppar += sumAppar;
        }
      });

      wsRiepilogoFatto.addRow([]);
      wsRiepilogoFatto.addRow(["TOTALE GENERALE", "", granTotaleIllumFatto, granTotaleAppar, granTotaleIllumFatto + granTotaleAppar]);
      wsRiepilogoFatto.getRow(wsRiepilogoFatto.rowCount).font = { bold: true };

      wsRiepilogoFatto.getColumn('B').width = 30;
      wsRiepilogoFatto.getColumn('C').width = 25;
      wsRiepilogoFatto.getColumn('D').width = 25;
      wsRiepilogoFatto.getColumn('E').width = 30;

      wsRiepilogoProg.addRow([]);
      wsRiepilogoProg.addRow(["TOTALE GENERALE", "", granTotaleIllumProg, granTotaleAppar, granTotaleIllumProg + granTotaleAppar]);
      wsRiepilogoProg.getRow(wsRiepilogoProg.rowCount).font = { bold: true };

      wsRiepilogoProg.getColumn('B').width = 30;
      wsRiepilogoProg.getColumn('C').width = 30;
      wsRiepilogoProg.getColumn('D').width = 25;
      wsRiepilogoProg.getColumn('E').width = 30;
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    let suffisso = tipoExport.toUpperCase();
    if (tipoExport === 'tutto') suffisso = 'COMPLETO';
    if (tipoExport === 'elettrico') suffisso = 'RIEPILOGO_ELETTRICO';

    const nomeFile = `Rilievo_${edificio.nome.replace(/\s+/g, '_')}_${suffisso}.xlsx`;
    saveAs(blob, nomeFile);

  } catch (error) {
    alert("Errore nell'esportazione excel. Controlla la console.");
    console.error(error);
  }
}