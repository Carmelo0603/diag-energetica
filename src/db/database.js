import Dexie from "dexie";

// Inizializza l'istanza del database
export const db = new Dexie("DiagnosiEnergeticaDB");

// Definisce lo schema delle tabelle (Store)
db.version(1).stores({
  // 'id' è la chiave primaria. 'data_creazione' ci servirà per ordinare la lista nella dashboard
  edifici: "id, tipologia, data_creazione",

  // 'id' è la chiave primaria. 'id_edificio' è l'indice secondario per estrarre le stanze corrette
  ambienti: "id, id_edificio",
});
