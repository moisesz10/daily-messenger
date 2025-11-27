import React, { useEffect, useState } from 'react';
import { fetchLogs } from '../api';

const MessageLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadLogs = async () => {
            try {
                const data = await fetchLogs();
                setLogs(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        loadLogs();
    }, []);

    if (loading) return <div>Loading logs...</div>;
    if (error) return <div className="text-red-500">Error loading logs: {error}</div>;

    return (
        <div className="overflow-x-auto mt-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Message History</h3>
            <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                        <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                        <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase">Info</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {logs.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50">
                            <td className="py-2 px-4 text-sm text-gray-900">{new Date(log.sent_at).toLocaleString()}</td>
                            <td className="py-2 px-4 text-sm text-gray-900">{log.name} ({log.email})</td>
                            <td className="py-2 px-4 text-sm">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${log.status === 'ok' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {log.status}
                                </span>
                            </td>
                            <td className="py-2 px-4 text-sm text-gray-500">{log.info}</td>
                        </tr>
                    ))}
                    {logs.length === 0 && (
                        <tr>
                            <td colSpan="4" className="py-4 px-4 text-center text-gray-500">No logs found</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default MessageLogs;
