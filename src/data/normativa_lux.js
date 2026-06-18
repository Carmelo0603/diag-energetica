export const NORMATIVA_LUX = {
  residenziale: {
    label: "Condominio / Residenziale",
    isResidenziale: true,
    ambienti: [
      { id: "res_soggiorno", label: "Soggiorno / Salotto", lux_normativi: 200 },
      { id: "res_cucina", label: "Cucina (Generale)", lux_normativi: 200 },
      { id: "res_camera", label: "Camera da letto", lux_normativi: 150 },
      { id: "res_bagno", label: "Bagno", lux_normativi: 150 },
      { id: "res_corridoio", label: "Corridoi e Scale", lux_normativi: 100 },
    ],
  },
  ufficio: {
    label: "Uffici / Terziario",
    isResidenziale: false,
    ambienti: [
      { id: "uff_postazione", label: "Postazione PC", lux_normativi: 500 },
      { id: "uff_riunioni", label: "Sala Riunioni", lux_normativi: 500 },
      { id: "uff_archivio", label: "Archivio", lux_normativi: 200 },
    ],
  },
  scuola: {
    label: "Scuole e Istituti",
    isResidenziale: false,
    ambienti: [
      { id: "scuola_aula", label: "Aula per lezioni", lux_normativi: 500 },
      { id: "scuola_laboratorio", label: "Laboratorio / Informatica", lux_normativi: 500 },
      { id: "scuola_ufficio", label: "Uffici / Segreteria / Presidenza", lux_normativi: 500 },
      { id: "scuola_biblioteca", label: "Biblioteca / Sala Lettura", lux_normativi: 500 },
      { id: "scuola_aulamagna", label: "Aula Magna / Auditorium", lux_normativi: 500 },
      { id: "scuola_palestra", label: "Palestra Scolastica", lux_normativi: 300 },
      { id: "scuola_mensa", label: "Mensa", lux_normativi: 200 },
      { id: "scuola_wc", label: "Servizi Igienici", lux_normativi: 200 },
      { id: "scuola_corridoio", label: "Corridoi e Aree di transito", lux_normativi: 100 },
    ],
  },
};
