const getHeaders = () => {
    const token = localStorage.getItem('adminToken');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
    };
};

export const fetchUsers = async () => {
    const response = await fetch('/users', {
        headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
};

export const subscribeUser = async (name, email) => {
    const response = await fetch('/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to subscribe');
    }
    return response.json();
};

export const unsubscribeUser = async (email) => {
    const response = await fetch('/unsubscribe', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email }),
    });
    if (!response.ok) throw new Error('Failed to unsubscribe');
    return response.json();
};

export const fetchLogs = async () => {
    const response = await fetch('/logs', {
        headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch logs');
    return response.json();
};
