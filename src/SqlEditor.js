import React, { useCallback } from 'react';
import CodeMirror, { placeholder } from "@uiw/react-codemirror";
import { StandardSQL } from '@codemirror/lang-sql';


const SqlEditor = ({ sqlQuery, setSqlQuery }) => {
    const onChange = useCallback((val) => {
        setSqlQuery(val);
    });

    return (
        <div>
            <CodeMirror value={sqlQuery} height="200px" extensions={[StandardSQL, placeholder("SELECT * FROM 'data.parquet' LIMIT 5")]} onChange={onChange} />
        </div>
    );
}

export default SqlEditor;