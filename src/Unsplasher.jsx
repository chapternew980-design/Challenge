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

  // Education Archive State (Loaded from localStorage if available)
  const [subjects, setSubjects] = useState(() => {
    const saved = localStorage.getItem('education_archive');
    return saved ? JSON.parse(saved) : [];
  });

  const [newSubjectName, setNewSubjectName] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [examTitle, setExamTitle] = useState('');
  const [examScore, setExamScore] = useState('');
  const [examDate, setExamDate] = useState('');

  // Save education data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('education_archive', JSON.stringify(subjects));
  }, [subjects]);

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

  // Education Archive Helper Functions
  const handleAddSubject = (e) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;

    const newSubject = {
      id: Date.now(),
      name: newSubjectName.trim(),
      exams: []
    };

    setSubjects([...subjects, newSubject]);
    setNewSubjectName('');
  };

  const handleAddExam = (e, subjectId) => {
    e.preventDefault();
    if (!examTitle.trim() || !examScore.trim()) return;

    const newExam = {
      id: Date.now(),
      title: examTitle.trim(),
      score: examScore.trim(),
      date: examDate || 'No date'
    };

    setSubjects(subjects.map(sub => {
      if (sub.id === subjectId) {
        return { ...sub, exams: [...sub.exams, newExam] };
      }
      return sub;
    }));

    setExamTitle('');
    setExamScore('');
    setExamDate('');
    setSelectedSubjectId(null);
  };

  const handleDeleteSubject = (subjectId) => {
    setSubjects(subjects.filter(sub => sub.id !== subjectId));
  };

  const handleDeleteExam = (subjectId, examId) => {
    setSubjects(subjects.map(sub => {
      if (sub.id === subjectId) {
        return { ...sub, exams: sub.exams.filter(exam => exam.id !== examId) };
      }
      return sub;
    }));
  };

  return (
    <div className="layout-wrapper">
      {/* 1. PERMANENT NARROW LEFT FRAME */}
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
            className={`nav-btn ${currentPage === 'ai' ? 'active' : ''}`}
            onClick={() => { setCurrentPage('ai'); setSidebarOpen(false); }}
          >
            🤖 AI Assistant
          </button>

          <button 
            className={`nav-btn ${currentPage === 'education' ? 'active' : ''}`}
            onClick={() => { setCurrentPage('education'); setSidebarOpen(false); }}
          >
            📚 Education Archive
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

        {/* 🤖 AI ASSISTANT PAGE */}
        {currentPage === 'ai' && (
          <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1 className="title">AI Assistant</h1>
            <p className="subtitle">Chat with your AI prompt assistant</p>
            
            <div className="chat-container" style={{ maxWidth: '100%' }}>
              <div className="chat-box">
                {messages.length === 0 && (
                  <div className="placeholder-text" style={{ margin: 'auto' }}>
                    Type a prompt below to start talking to your local AI model!
                  </div>
                )}
                {messages.map((msg, index) => (
                  <div key={index} className={`message ${msg.sender}`}>
                    {msg.text}
                  </div>
                ))}
                {aiLoading && <div className="message ai">Thinking...</div>}
              </div>

              <form onSubmit={handleSendMessage} className="chat-input-form">
                <input
                  type="text"
                  className="chat-input"
                  placeholder="Ask the AI something..."
                  value={inputPrompt}
                  onChange={(e) => setInputPrompt(e.target.value)}
                />
                <button type="submit" className="send-btn" disabled={aiLoading}>
                  Send
                </button>
              </form>
            </div>
          </div>
        )}

        {/* 📚 EDUCATION ARCHIVE PAGE */}
        {currentPage === 'education' && (
          <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1 className="title">📚 Education Archive</h1>
            <p className="subtitle">Track your subjects, exam details, and scores</p>

            {/* Add Subject Form */}
            <form onSubmit={handleAddSubject} className="search-controls" style={{ marginBottom: '30px' }}>
              <input
                type="text"
                className="input"
                placeholder="Enter subject name (e.g., Mathematics)..."
                value={newSubjectName}
                onChange={(e) => setNewSubjectName(e.target.value)}
                style={{ width: '100%', maxWidth: 'none' }}
              />
              <button type="submit" className="fetch-btn">Add Subject</button>
            </form>

            {/* Subjects List */}
            <div style={{ textAlign: 'left' }}>
              {subjects.length === 0 ? (
                <p className="placeholder-text" style={{ textAlign: 'center', padding: '20px' }}>
                  No subjects added yet. Add a subject above to start archiving your exams!
                </p>
              ) : (
                subjects.map((sub) => (
                  <div key={sub.id} className="edu-subject-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                      <h2 style={{ color: '#ffffff', margin: 0, fontSize: '1.2rem' }}>📖 {sub.name}</h2>
                      <div>
                        <button 
                          type="button"
                          onClick={() => setSelectedSubjectId(selectedSubjectId === sub.id ? null : sub.id)}
                          className="edu-action-btn primary"
                        >
                          {selectedSubjectId === sub.id ? 'Cancel' : '+ Add Exam'}
                        </button>
                        <button 
                          type="button"
                          onClick={() => handleDeleteSubject(sub.id)}
                          className="edu-action-btn danger"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {/* Add Exam Form */}
                    {selectedSubjectId === sub.id && (
                      <form onSubmit={(e) => handleAddExam(e, sub.id)} className="edu-exam-form">
                        <input
                          type="text"
                          className="input"
                          placeholder="Exam details / title (e.g., Midterm Exam)..."
                          value={examTitle}
                          onChange={(e) => setExamTitle(e.target.value)}
                          style={{ width: '100%', maxWidth: 'none' }}
                        />
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <input
                            type="text"
                            className="input"
                            placeholder="Score (e.g., 95/100 or A)..."
                            value={examScore}
                            onChange={(e) => setExamScore(e.target.value)}
                            style={{ width: '100%', maxWidth: 'none' }}
                          />
                          <input
                            type="date"
                            className="input"
                            value={examDate}
                            onChange={(e) => setExamDate(e.target.value)}
                            style={{ width: '100%', maxWidth: 'none' }}
                          />
                        </div>
                        <button type="submit" className="fetch-btn" style={{ alignSelf: 'flex-start' }}>Save Exam</button>
                      </form>
                    )}

                    {/* Exams List under Subject */}
                    {sub.exams.length === 0 ? (
                      <p style={{ color: '#9ca3af', fontStyle: 'italic', fontSize: '0.9rem', margin: 0 }}>No exams recorded for this subject yet.</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {sub.exams.map((exam) => (
                          <div key={exam.id} className="edu-exam-item">
                            <div>
                              <strong style={{ color: '#f3f4f6' }}>{exam.title}</strong>
                              <span style={{ color: '#9ca3af', marginLeft: '12px', fontSize: '0.85rem' }}>📅 {exam.date}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                              <span className="edu-score-badge">{exam.score}</span>
                              <button 
                                type="button"
                                onClick={() => handleDeleteExam(sub.id, exam.id)}
                                className="edu-delete-exam-btn"
                                title="Delete Exam"
