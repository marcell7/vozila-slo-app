const QueryOutput = ({ result }) => {

    let resultToRender = result.data;
    if (result.data.length >= 50) {
        resultToRender = result.data.slice(0, 100);
    }

    return (
        <div className="flex flex-col rounded-lg">
            <div className="-m-1.5 overflow-x-auto">
                <div className="p-1.5 min-w-full inline-block align-middle">
                    <div className="border overflow-hidden dark:border-gray-700 rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead>
                                <tr>
                                    {result.cols.map((col, colIdx) => (
                                        <th key={colIdx} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{col}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {resultToRender.map((row, rowIdx) => (
                                    <tr key={rowIdx}>
                                        {row.map((cell, cellIdx) => (
                                            <td key={cellIdx} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-gray-200">{cell == null ? cell : cell.toString()}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default QueryOutput;