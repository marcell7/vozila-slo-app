import Dexie from "dexie";


export const dexieDb = new Dexie("slo-vehicles-data");
dexieDb.version(1).stores({
    files: "dataset"
})