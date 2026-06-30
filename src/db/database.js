import Dexie from "dexie";

// Inizializza l'istanza del database
export const db = new Dexie("DiagnosiEnergeticaDB");

// Incrementiamo la versione a 2 per aggiungere gli indici di sincronizzazione
db.version(2).stores({
  edifici: "id, tipologia, data_creazione, is_synced, last_modified",
  ambienti: "id, id_edificio, is_synced, last_modified",
});

// --- HOOKS: Magia pura per non dover riscrivere il resto dell'app ---

// Quando viene CREATO un nuovo record, aggiungiamo is_synced e last_modified
function onCreating(primKey, obj) {
  if (obj.is_synced === undefined) obj.is_synced = 0; // 0 = non sincronizzato, 1 = sincronizzato
  if (!obj.last_modified) obj.last_modified = new Date().toISOString();
}

// Quando viene AGGIORNATO un record esistente
function onUpdating(mods, primKey, obj) {
  // Se l'aggiornamento viene dal nostro futuro Sync Engine (che imposta is_synced a 1), lo lasciamo passare
  if (mods.is_synced === 1) return;

  // Altrimenti è l'utente che sta modificando l'app, quindi "sporchiamo" il record
  return { is_synced: 0, last_modified: new Date().toISOString() };
}

// Applichiamo gli hooks alle tabelle
db.edifici.hook('creating', onCreating);
db.edifici.hook('updating', onUpdating);

db.ambienti.hook('creating', onCreating);
db.ambienti.hook('updating', onUpdating);