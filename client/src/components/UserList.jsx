import React, { useEffect, useState } from 'react';
import { fetchUsers, unsubscribeUser } from '../api';

const UserList = ({ refreshTrigger }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await fetchUsers();
            setUsers(data);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, [refreshTrigger]);

    const handleUnsubscribe = async (email) => {
        if (!confirm(`Are you sure you want to unsubscribe ${email}?`)) return;
        try {
            await unsubscribeUser(email);
            loadUsers();
        } catch (err) {
            alert(err.message);
        }
    };

    if (loading) return <div className="text-center p-4">Loading...</div>;
    if (error) return <div className="text-red-500 p-4">Error: {error}</div>;

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                            <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-900">{user.id}</td>
                            <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-900">{user.name}</td>
                            <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                            <td className="py-4 px-4 whitespace-nowrap text-sm font-medium">
                                <button
                                    onClick={() => handleUnsubscribe(user.email)}
                                    className="text-red-600 hover:text-red-900"
                                >
                                    Unsubscribe
                                </button>
                            </td>
                        </tr>
                    ))}
                    {users.length === 0 && (
                        <tr>
                            <td colSpan="4" className="py-4 px-4 text-center text-gray-500">No users found</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default UserList;
