import React, { useState, useEffect } from 'react';
import './App.css'; 

export default function App() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [zanra, setZanra] = useState('');
  
  // UI States
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [fullScreenImage, setFullScreenImage] = useState(null);
  const [currentPage, setCurrentPage] = useState('home');

  // AI Chat State
  const [messages, setMessages] = useState([]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // 🎓 Education Records Archive State
  const [records, setRecords] = useState([
    {
      id: 1,
      subject: 'Mathematics',
      title: 'Midterm Exam - Calculus & Algebra',
      date: '2026-05-15',
      score: '95/100',
      details: 'Reviewed integration by parts and matrix multiplication. Excellent work on polynomial expressions.',
      imageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80'
    }
  ]);
  const [filterSubject, setFilterSubject] = useState('All');
  const [newRecord, setNewRecord] = useState({
    subject: 'Mathematics',
    title: '',
    date: '',
    score: '',
    details: '',
    imageUrl: ''
  });

  const ACCESS_KEY = '_XfKJaR2bkrcDMV1VjvRIlHX9V91NWf5O7HOMgMbeqk';

  const fetchImages = async (searchTerm = '') => {
    setLoading(true);
    setError(null);
    
    try {
      const queryParam = searchTerm || zanra.trim() || 'sketch';
      
      const response = await fetch(
        `https://api.unsplash.com/search/photos?client_id=${ACCESS_KEY}&query=${encodeURIComponent(queryParam)}&per_page=30`
      );
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setImages(data.results || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch images');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages('drawing inspiration');
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputPrompt.trim() || aiLoading) return;

    const userMessage = { sender: 'user', text: inputPrompt };
    setMessages((prev) => [...prev, userMessage]);
    setInputPrompt('');
    setAiLoading(true);

    try {
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3',
          prompt: inputPrompt,
          stream: false
        })
      });

      const data = await response.json();
      const aiReply = data.response || 'No response received from local AI.';

      setMessages((prev) => [...prev, { sender: 'ai', text: aiReply }]);
    } catch (err) {
      console.error('Error fetching local AI:', err);
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: '⚠️ Unable to connect to your local AI endpoint. Make sure your local server is running.' }
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  // Image Upload Handler for Education Records
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewRecord((prev) => ({ ...prev, imageUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Add New Education Record
  const handleAddRecord = (e) => {
    e.preventDefault();
    if (!newRecord.title || !newRecord.imageUrl) {
      alert('Please provide a title and select/upload an image!');
      return;
    }

    const createdRecord = {
      ...newRecord,
      id: Date.now()
    };

    setRecords((prev) => [createdRecord, ...prev]);
    setNewRecord({
      subject: 'Mathematics',
      title: '',
      date: '',
      score: '',
      details: '',
      imageUrl: ''
    });
  };

  const filteredRecords = filterSubject === 'All' 
    ? records 
    : records.filter((rec) => rec.subject === filterSubject);

  return (
    <div className="layout-wrapper">
      {/* 1. PERMANENT LEFT FRAME */}
      <aside className="left-frame">
        <button 
          className="transparent-menu-icon" 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          title="Toggle Navigation"
        >
          ☰
        </button>
      </aside>

      {/* 2. SIDEBAR NAVIGATION DRAWER */}
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <button className="close-sidebar-btn" onClick={() => setSidebarOpen(false)}>×</button>
        <h2 className="sidebar-title">Navigation</h2>
        
        <nav className="sidebar-nav">
          <button 
            className={`nav-btn ${currentPage === 'home' ? 'active' : ''}`}
            onClick={() => { setCurrentPage('home'); setSidebarOpen(false); }}
          >
            🏠 Home
          </button>

          <button 
            className={`nav-btn ${currentPage === 'education' ? 'active' : ''}`}
            onClick={() => { setCurrentPage('education'); setSidebarOpen(false); }}
          >
            🎓 Exam Records Archive
          </button>

          <button 
            className={`nav-btn ${currentPage === 'ai' ? 'active' : ''}`}
            onClick={() => { setCurrentPage('ai'); setSidebarOpen(false); }}
          >
            🤖 AI Assistant
          </button>
          
          <button 
            className={`nav-btn ${currentPage === 'changes' ? 'active' : ''}`}
            onClick={() => { setCurrentPage('changes'); setSidebarOpen(false); }}
          >
            🛠 Changes
          </button>
          
          <button 
            className={`nav-btn ${currentPage === 'others' ? 'active' : ''}`}
            onClick={() => { setCurrentPage('others'); setSidebarOpen(false); }}
          >
            🔗 Others
          </button>
          
          <button 
            className={`nav-btn ${currentPage === 'about' ? 'active' : ''}`}
            onClick={() => { setCurrentPage('about'); setSidebarOpen(false); }}
          >
            ℹ️ About Us
          </button>
        </nav>
      </div>

      {/* 3. MAIN CONTENT AREA */}
      <main className="main-content">
        {/* 🏠 HOME PAGE */}
        {currentPage === 'home' && (
          <div className="card">
            <h1 className="title">Drawing Inspiration</h1>
            <p className="subtitle">Fetch reference sketches directly from Unsplash</p>

            <div className="search-controls">
              <input 
                className="input" 
                onChange={(e) => setZanra(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && fetchImages()}
                value={zanra} 
                type="text" 
                placeholder="🔍 Search sketches..."
              />
              
              <button
                onClick={() => fetchImages()}
                disabled={loading}
                className="fetch-btn"
              >
                {loading ? 'Fetching...' : 'Get Drawings'}
              </button>
            </div>

            {error && <p className="error-msg">{error}</p>}

            <div className="image-grid">
              {loading ? (
                Array.from({ length: 12 }).map((_, index) => (
                  <div key={index} className="skeleton-card">
                    <div className="skeleton-image"></div>
                  </div>
                ))
              ) : images.length > 0 ? (
                images.map((img) => (
                  <div 
                    key={img.id} 
                    className="grid-item"
                    onClick={() => setFullScreenImage(img.urls.regular)}
                  >
                    <img src={img.urls.small} alt={img.alt_description || "Reference photo"} />
                    <div className="hover-overlay">Click for Full View 🔍</div>
                  </div>
                ))
              ) : (
                <div className="placeholder-wrapper">
                  <p className="placeholder-text">Type something above and click "Get Drawings" to load results!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 🎓 EDUCATION RECORDS ARCHIVE PAGE */}
        {currentPage === 'education' && (
          <div className="card">
            <h1 className="title">🎓 Education Records Archive</h1>
            <p className="subtitle">Upload, categorize, and archive your exam results and notes</p>

            {/* Add New Record Form */}
            <form onSubmit={handleAddRecord} style={{ maxWidth: '600px', margin: '20px auto', textAlign: 'left', background: '#1e293b', padding: '20px', borderRadius: '12px' }}>
              <h3 style={{ marginTop: 0, color: '#f3f4f6' }}>➕ Add New Exam Record</h3>
              
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', color: '#9ca3af', fontSize: '14px', marginBottom: '4px' }}>Subject Category</label>
                <select 
                  className="input"
                  value={newRecord.subject} 
                  onChange={(e) => setNewRecord({ ...newRecord, subject: e.target.value })}
                  style={{ width: '100%' }}
                >
                  <option value="Mathematics">Mathematics</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="English">English</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', color: '#9ca3af', fontSize: '14px', marginBottom: '4px' }}>Exam Title</label>
                <input 
                  type="text" 
                  className="input" 
                  placeholder="e.g. Physics Final Exam Chapter 4"
                  value={newRecord.title}
                  onChange={(e) => setNewRecord({ ...newRecord, title: e.target.value })}
                  style={{ width: '100%' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', color: '#9ca3af', fontSize: '14px', marginBottom: '4px' }}>Date</label>
                  <input 
                    type="date" 
                    className="input" 
                    value={newRecord.date}
                    onChange={(e) => setNewRecord({ ...newRecord, date: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', color: '#9ca3af', fontSize: '14px', marginBottom: '4px' }}>Score / Grade</
