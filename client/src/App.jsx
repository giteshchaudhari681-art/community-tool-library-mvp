import React, { useEffect, useState } from 'react';
import ToolList from './components/ToolList';
import AddToolForm from './components/AddToolForm';
import './App.css';

function App() {
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTools = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/tools');
      if (!response.ok) {
        throw new Error('Failed to fetch tools');
      }

      const data = await response.json();
      setTools(data);
    } catch (fetchError) {
      console.error('Error fetching tools:', fetchError);
      setError('Unable to load tools right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTools();
  }, []);

  const handleToolAdded = (newTool) => {
    setTools((currentTools) => [newTool, ...currentTools]);
  };

  const handleToolUpdate = (updatedTool) => {
    setTools((currentTools) =>
      currentTools.map((tool) =>
        tool.id === updatedTool.id ? updatedTool : tool
      )
    );
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="logo">
          <span className="icon" aria-hidden="true">🛠️</span>
          <h1>Community Tool Library</h1>
        </div>
        <p className="subtitle">Borrow what you need. Share what you own.</p>
      </header>

      <main className="app-content">
        <section>
          <AddToolForm onToolAdded={handleToolAdded} />
        </section>
        <section>
          {loading ? (
            <div className="loader">Loading tools...</div>
          ) : error ? (
            <div className="loader">{error}</div>
          ) : (
            <ToolList tools={tools} onUpdateTool={handleToolUpdate} />
          )}
        </section>
      </main>

      <footer className="app-footer">
        <p>© 2026 Community Tool Library</p>
      </footer>
    </div>
  );
}

export default App;
