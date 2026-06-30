export const NORMATIVA_LUX = {
  residenziale: {
    label: "Condominio / Residenziale",
    isResidenziale: true,
    ambienti: [
      { id: "res_ingressi", label: "Ingressi", lux_normativi: 100 },
      { id: "res_corridoio", label: "Corridoio", lux_normativi: 100 },
      { id: "res_scala", label: "Scala", lux_normativi: 150 },
      { id: "res_soggiorno", label: "Soggiorno / Living", lux_normativi: 200 },
      { id: "res_cucina", label: "Cucina", lux_normativi: 300 },
      { id: "res_camera", label: "Camera da letto", lux_normativi: 300 },
      { id: "res_bagno", label: "Bagno", lux_normativi: 200 },
      { id: "res_studio", label: "Studio / Home Office", lux_normativi: 500 },
      { id: "res_ripostiglio", label: "Ripostiglio", lux_normativi: 100 },
      { id: "res_garage", label: "Garage", lux_normativi: 200 },
      { id: "res_cantina", label: "Cantina", lux_normativi: 200 },
      { id: "res_sottotetto", label: "Sottotetto", lux_normativi: 200 }
    ],
  },
  ufficio: {
    label: "Uffici / Terziario",
    isResidenziale: false,
    ambienti: [
      { id: "uff_archivi_rara", label: "Archivi (consultazione rara)", lux_normativi: 200 },
      { id: "uff_corridoi", label: "Corridoi e aree transito", lux_normativi: 100 },
      { id: "uff_singoli_open", label: "Uffici singoli / Open space", lux_normativi: 500 },
      { id: "uff_riunioni", label: "Sale riunioni e conferenze", lux_normativi: 500 },
      { id: "uff_reception", label: "Reception / Accoglienza", lux_normativi: 300 },
      { id: "uff_ristoro", label: "Sale ristoro / Break area", lux_normativi: 200 },
      { id: "uff_stampa", label: "Locali fotocopiatrici / Stampa", lux_normativi: 300 },
      { id: "uff_cad", label: "Ufficio disegno tecnico / CAD", lux_normativi: 750 },
      { id: "uff_archivi_intensa", label: "Archivio (consultazione intensa)", lux_normativi: 300 }
    ],
  },
  casa_riposo: {
    label: "Casa di Riposo / RSA",
    isResidenziale: false,
    ambienti: [
      { id: "rsa_ingressi", label: "Ingressi e reception", lux_normativi: 300 },
      { id: "rsa_corridoi", label: "Corridoi e percorsi", lux_normativi: 200 },
      { id: "rsa_scale", label: "Scale e rampe", lux_normativi: 200 },
      { id: "rsa_camere", label: "Camere di degenza", lux_normativi: 100 },
      { id: "rsa_lettura", label: "Zona lettura in camera", lux_normativi: 300 },
      { id: "rsa_bagni", label: "Bagni (degenza)", lux_normativi: 300 },
      { id: "rsa_comuni", label: "Sale comuni / TV", lux_normativi: 200 },
      { id: "rsa_pranzo", label: "Sale da pranzo", lux_normativi: 300 },
      { id: "rsa_ambulatorio", label: "Ambulatorio / Infermeria", lux_normativi: 500 },
      { id: "rsa_palestra", label: "Fisioterapia / Palestra", lux_normativi: 300 },
      { id: "rsa_cappella", label: "Cappella / Area relax", lux_normativi: 150 },
      { id: "rsa_tecnici", label: "Locali tecnici / lavanderia", lux_normativi: 300 }
    ],
  },
  scuola: {
    label: "Scuole e Istituti",
    isResidenziale: false,
    ambienti: [
      { id: "scuola_infanzia", label: "Aule d'infanzia / Asili nido", lux_normativi: 300 },
      { id: "scuola_diurne", label: "Aule di lezione diurne", lux_normativi: 300 },
      { id: "scuola_serali", label: "Aule per corsi serali e istruzione adulti", lux_normativi: 500 },
      { id: "scuola_disegno", label: "Aule di disegno tecnico", lux_normativi: 750 },
      { id: "scuola_arte", label: "Aule di disegno e arte (Scuole d'arte)", lux_normativi: 500 },
      { id: "scuola_lab_scienze", label: "Laboratori scientifici e officine", lux_normativi: 500 },
      { id: "scuola_lab_info", label: "Aule informatiche e laboratori linguistici", lux_normativi: 300 },
      { id: "scuola_musica", label: "Sale musica e aule di pratica musicale", lux_normativi: 300 },
      { id: "scuola_biblio_lettura", label: "Biblioteche: sale di lettura", lux_normativi: 500 },
      { id: "scuola_biblio_scaffali", label: "Biblioteche: zone scaffalature", lux_normativi: 200 },
      { id: "scuola_palestre", label: "Palestre e campi da gioco interni", lux_normativi: 300 },
      { id: "scuola_atri", label: "Atri, ingressi principali e zone accoglienza", lux_normativi: 200 },
      { id: "scuola_corridoi", label: "Corridoi e aree di circolazione generali", lux_normativi: 100 },
      { id: "scuola_scale", label: "Scale, rampe e passaggi pedonali", lux_normativi: 150 },
      { id: "scuola_servizi", label: "Servizi igienici e antibagni", lux_normativi: 200 },
      { id: "scuola_uffici", label: "Uffici, Presidenza e Sala professori", lux_normativi: 500 },
      { id: "scuola_infermeria", label: "Infermeria e locali di primo soccorso", lux_normativi: 500 },
      { id: "scuola_mense", label: "Mense scolastiche e refettori", lux_normativi: 200 }
    ],
  }
};