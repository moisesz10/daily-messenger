import React, { useState, useEffect } from 'react';
import SubscribeForm from './components/SubscribeForm';
import UserList from './components/UserList';
import MessageLogs from './components/MessageLogs';
import Login from './pages/Login';

function App() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('subscribers'); // 'subscribers' or 'logs'

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) setIsAuthenticated(true);
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
  };

  const handleSubscribeSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10 text-center relative">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Daily Messenger</h1>
          <p className="text-lg text-gray-600">Manage your subscribers efficiently</p>
          <button
            onClick={handleLogout}
            className="absolute top-0 right-0 text-sm text-red-600 hover:text-red-800"
          >
            Logout
          </button>
        </header>

        <main>
          <div className="mb-6 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('subscribers')}
                className={`${activeTab === 'subscribers'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Subscribers
              </button>
              <button
                onClick={() => setActiveTab('logs')}
                className={`${activeTab === 'logs'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Message History
              </button>
            </nav>
          </div>

          {activeTab === 'subscribers' ? (
            <>
              <SubscribeForm onSubscribeSuccess={handleSubscribeSuccess} />
              <div className="mt-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Active Subscribers</h2>
                <UserList refreshTrigger={refreshKey} />
              </div>
            </>
          ) : (
            <MessageLogs />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
