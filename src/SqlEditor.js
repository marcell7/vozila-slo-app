import React, { useCallback, useState } from 'react';
import CodeMirror, { placeholder } from "@uiw/react-codemirror";
import { StandardSQL } from '@codemirror/lang-sql';


const SqlEditor = ({ sqlQuery, setSqlQuery }) => {
    const onChange = useCallback((val, viewUpdate) => {
        setSqlQuery(val);
    });

    return (
        <div>
            <CodeMirror value={sqlQuery} height="200px" extensions={[StandardSQL, placeholder("SELECT * FROM dataset")]} onChange={onChange} />
        </div>
    );
}

export default SqlEditor;