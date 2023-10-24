import * as duckdb from "@duckdb/duckdb-wasm";
import { dexieDb } from "./Dexie";


export const init = async (duckdb) => {
    const CDN_BUNDLES = duckdb.getJsDelivrBundles();
    const bundle = await duckdb.selectBundle(CDN_BUNDLES);
    const workerUrl = URL.createObjectURL(
        new Blob([`importScripts("${bundle.mainWorker}");`], {
            type: "text/javascript",
        })
    );

    const worker = new Worker(workerUrl);
    const logger = new duckdb.ConsoleLogger("INFO");
    const db = new duckdb.AsyncDuckDB(logger, worker);
    await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
    URL.revokeObjectURL(workerUrl);
    return db;
};

export const createTable = async (db, local_data_ver) => {
    const installedData = await dexieDb.files.get(local_data_ver);
    if (installedData) {
        console.log("Creating a blob");
        let blob = installedData.data;
        await db.registerFileBuffer(
            "data.parquet",
            new Uint8Array(await blob.arrayBuffer())
        );
    }
    return true;
};

export const initDb = async () => {
    const db = await init(duckdb);
    const con = await db.connect();
    return { "db": db, "con": con };;
};

export const query = async (con, query) => {
    const res = await con.query(query);
    console.log(res);
    const cols = res.schema.fields.map((field) => field.name);
    const data = res.toArray().map((row) => row.toArray());
    return { cols: cols, data: data };
};
