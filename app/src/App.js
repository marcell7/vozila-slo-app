import React, { useState, useEffect } from "react";
import Dexie from "dexie";
import axios from "axios";

import SqlEditor from "./SqlEditor";
import QueryOutput from "./QueryOutput";
import { initDb, createTable, query } from "./DuckDb";
import { dexieDb } from "./Dexie";
import { downloadCSV } from "./Utils";
import {
    PlayIcon,
    ArrowDownTrayIcon,
    CloudArrowDownIcon,
} from "@heroicons/react/24/outline";


const DATA_URL = "https://dl.dropboxusercontent.com/scl/fi/69tihadmivpurea54ge3u/dataset_v1.parquet?rlkey=6mrby0be2hq6jnbubohrxwey0&dl=0";
const LOCAL_DATA_VER = "dataset_v1";
const DEFAULT_SQL_QUERY = "SELECT * FROM 'data.parquet' LIMIT 5"

function App() {
    const [duckDb, setDuckDb] = useState(null);
    const [con, setCon] = useState(null);
    const [sqlQuery, setSqlQuery] = useState(DEFAULT_SQL_QUERY);

    const [loading, setLoading] = useState(false);
    const [dataFinishedInstalling, setDataFinishedInstalling] = useState(false);
    const [isDataInstalling, SetIsDataInstalling] = useState(false);
    const [isQueryRunning, setIsQueryRunning] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [queryError, setQueryError] = useState(null);
    const [result, setResult] = useState({ cols: [], data: [] });

    const onRunSqlQueryClick = async (con, sqlQuery) => {
        setQueryError(null);
        try {
            setIsQueryRunning(true);
            const res = await query(con, sqlQuery);
            setResult(res);
            setIsQueryRunning(false);
        }
        catch (e) {
            setIsQueryRunning(false);
            console.error(e.message);
            setQueryError(e.message);
        }
    };

    const onInstallDataClick = async () => {
        SetIsDataInstalling(true);
        const response = await axios({
            url: DATA_URL,
            method: "GET",
            responseType: "blob",
            onDownloadProgress: (e) => {
                let percCompleted = Math.round((e.loaded * 100) / e.total);
                setLoadingProgress(percCompleted);
            },
        });
        await dexieDb.files.put({
            dataset: LOCAL_DATA_VER,
            data: new Blob([response.data]),
        });
        SetIsDataInstalling(false);
        setDataFinishedInstalling(true);
        await createTable(duckDb, LOCAL_DATA_VER);
        await onRunSqlQueryClick(con, sqlQuery);
    };

    useEffect(() => {
        const checkLocalDbExistance = async () => {
            let _exists = false;
            let localDb = await Dexie.exists("slo-vehicles-data");
            if (localDb) {
                try {
                    let dataInLocalDb = await dexieDb.files.get(LOCAL_DATA_VER);
                    if (dataInLocalDb.dataset === LOCAL_DATA_VER) {
                        _exists = true;
                    }
                } catch (e) {
                    console.error(e);
                }
            }
            return _exists;
        };

        const init = async () => {
            let resp = await initDb();
            let _duckDb = resp.db;
            let _con = resp.con;
            setDuckDb(_duckDb);
            setCon(_con);
            let localDbExists = await checkLocalDbExistance();
            if (localDbExists) {
                setLoading(true);
                await createTable(_duckDb, LOCAL_DATA_VER);
                await onRunSqlQueryClick(_con, sqlQuery);
                setDataFinishedInstalling(true);
                setLoading(false);
            }
        };

        init();
    }, []);

    return (
        <div className="h-screen relative overflow-x-hidden">
            <div
                aria-hidden="true"
                className="flex absolute -top-96 left-1/2 transform -translate-x-1/2"
            >
                <div className="bg-gradient-to-r from-violet-300/50 to-purple-100 blur-3xl w-[25rem] h-[44rem] rotate-[-60deg] transform -translate-x-[10rem]"></div>
                <div className="bg-gradient-to-tl from-blue-50 via-blue-100 to-blue-50 blur-3xl w-[90rem] h-[50rem] rounded-fulls origin-top-left -rotate-12 -translate-x-[15rem]"></div>
            </div>

            <div className="relative z-10">
                <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 mt-20 lg:py-12">
                    <div className="mb-8">
                        <div className="flex space-x-2 mt-5 max-w-2xl items-center">
                            <h1 className="block font-semibold text-gray-800 text-lg md:text-xl lg:text-2xl">
                                Avtomobili v Sloveniji
                            </h1>
                        </div>

                        <div className="flex flex-row justify-between">
                            <div className="mt-2 mr-5 max-w-3xl">
                                <p className="mb-3 text-sm text-gray-600 text-justify">
                                    To je spletna aplikacija za analiziranje in izvažanje podatkov o vseh registriranih avtomobilih in njihovi zgodovini v Sloveniji.
                                    Vsa navodila in informacije najdeš <a href="https://github.com/marcell7/vozila-slo-app/blob/main/README.md" target="_blank" rel="noopener noreferrer" className="underline font-bold">tukaj.</a>
                                </p>
                                <p className="text-sm text-gray-600"><b>Vir:</b> Prvotni vir podatkov je spletna stran OPSI (https://podatki.gov.si/)</p>
                            </div>
                            <div className="flex items-end">
                                <span className="pt-4 text-xs text-gray-600">
                                    by{" "}
                                    <a href="https://marcellah.xyz" target="_blank" rel="noopener noreferrer" className="font-bold underline">
                                        @marcel
                                    </a>
                                </span>
                            </div>
                        </div>
                    </div>

                    <SqlEditor sqlQuery={sqlQuery} setSqlQuery={setSqlQuery} />
                    <div className="flex flex-row justify-between my-5 gap-2">
                        <button
                            type="button"
                            className="w-1/3 py-2 px-3 inline-flex justify-center items-center gap-2 rounded-md border font-medium bg-white text-gray-700 shadow-sm align-middle active:hover:bg-gray-50 focus:outline-none transition-all text-sm dark:bg-slate-900 dark:hover:bg-slate-800 dark:border-gray-700 dark:text-gray-400 dark:hover:text-white dark:focus:ring-offset-gray-800 disabled:opacity-75"
                            onClick={onInstallDataClick}
                            disabled={
                                loading | isDataInstalling | isQueryRunning
                            }
                        >

                            {isDataInstalling && (
                                <span
                                    className="ml-3 mr-2 animate-spin inline-block w-4 h-4 border-[3px] border-current border-t-transparent text-gray-700 rounded-full"
                                    role="status"
                                    aria-label="loading"
                                ></span>
                            )}
                            {dataFinishedInstalling
                                ? "Baza je uspešno shranjena. Ponovno prenesi?"
                                : "Prenesi celotno bazo"}
                        </button>
                        <button
                            type="button"
                            className="py-2 px-3 inline-flex justify-center items-center gap-2 rounded-md border font-medium bg-white text-gray-700 shadow-sm align-middle active:hover:bg-gray-50 transition-all text-sm disabled:opacity-75"
                            onClick={() => { onRunSqlQueryClick(con, sqlQuery) }}
                            disabled={
                                loading | isQueryRunning | isDataInstalling | !dataFinishedInstalling
                            }
                        >

                            {isQueryRunning ? (
                                <span
                                    className="ml-3 animate-spin inline-block w-4 h-4 border-[3px] border-current border-t-transparent text-gray-700 rounded-full"
                                    role="status"
                                    aria-label="loading"
                                ></span>
                            ) : (
                                <PlayIcon className="w-5 h-5 text-green-500" />
                            )}
                            Poženi
                        </button>
                    </div>
                    {isDataInstalling && (
                        <div class="mb-3 flex w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="flex flex-col justify-center overflow-hidden bg-gray-700"
                                role="progressbar"
                                style={{ width: `${loadingProgress}%` }}
                                aria-valuenow="25"
                                aria-valuemin="0"
                                aria-valuemax="100"
                            ></div>
                        </div>
                    )}
                    {dataFinishedInstalling &&
                        <div className="px-5 py-2 border-1 border-gray-200 shadow-md bg-white rounded-lg mt-10 border">
                            <div className="flex flex-row justify-between mt-4 mb-2 items-center">
                                <div className="space-x-2">
                                    <button
                                        type="button"
                                        className="px-3 py-2 inline-flex justify-center items-center rounded-md border font-medium bg-white text-gray-700 shadow-sm align-middle hover:bg-gray-50 transition-all text-sm"
                                        onClick={() => {
                                            downloadCSV(result);
                                        }}
                                    >
                                        <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
                                        Prenesi
                                    </button>
                                    {queryError && <span className="px-3 py-2 inline-flex justify-center items-center rounded-md border font-medium bg-white text-red-500 shadow-sm align-middle text-sm">Error: {queryError}</span>}
                                </div>
                                <div className="flex justify-end text-sm">
                                    <span className="px-3 py-2 inline-flex justify-center items-center gap-2 rounded-md border font-medium bg-white text-gray-700 shadow-sm align-middle text-sm">N: {result.data.length} </span>
                                </div>
                            </div>
                            <span className="mb-2 flex justify-end text-gray-400 text-xs">Spodaj je prikazanih max. 50 vrstic, prenesene pa bodo vse</span>
                            <QueryOutput result={result} />
                        </div>
                    }
                </div>
            </div>
        </div>
    );
}

export default App;
