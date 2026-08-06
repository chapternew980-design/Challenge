import React, { useState, useEffect } from 'react';
import './App.css'; 

export default function UnsplashImageFetcher() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [zanra, setZanra] = useState('');
  
  // UI States
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [fullScreenImage, setFullScreenImage] = useState(null);

  // 📍 FIXED: Changed 'Home' to lowercase 'home' to match button checks
  const [currentPage, setCurrentPage] = useState('home');

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

  // Auto-load initial photos on page open
  useEffect(() => {
    fetchImages('drawing inspiration');
  }, []);

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
        {/* 🏠 HOME PAGE VIEW */}
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
                placeholder="🔍Search"
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

            {/* IMAGE GRID & SKELETON LOADING */}
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

        {/* 🛠 CHANGES PAGE VIEW */}
        {currentPage === 'changes' && (
          <div className="card">
            <h1 className="title">🛠 Changes & Updates</h1>
            <p className="subtitle">Here is what we recently built in this app:</p>
            <div style={{ textAlign: 'left', maxWidth: '500px', margin: '20px auto', lineHeight: '1.8' }}>
              <p>✔️ Pictures amout improved to 30 per page</p>
              <p>✔️ Added menu and other pages.</p>
              <p>✔️ Changes in styling.</p>                
              <p>✔️ Added full-screen image preview overlay.</p>
              <p>✔️ Added sidebar menu navigation with instant page switching.</p>
              <p>✔️ Connected Unsplash API for custom image searches.</p>
              <p>🙌 And many other changes you can discover.</p>
            </div>
          </div>
        )}

        {/* 🔗 OTHERS PAGE VIEW */}
        {currentPage === 'others' && (
          <div className="card">
            <h1 className="title">🔗 Other Resources</h1>
            <p className="subtitle">Extra links and tools for artists will be added here soon.</p>
          </div>
        )}

        {/* ℹ️ ABOUT PAGE VIEW */}
        {currentPage === 'about' && (
          <div className="card">
            <h1 className="title">ℹ️ About Us</h1>
            <p className="subtitle">Drawing Inspiration App</p>
            <p style={{ maxWidth: '600px', margin: '0 auto', color: '#9ca3af' }}>
              This web app was designed to give artists quick and easy access to high-quality reference sketches directly from Unsplash.
            </p>
          </div>
        )}
      </main>

      {/* 4. OVERRIDING FULL-SCREEN COVER MODAL */}
      {fullScreenImage && (
        <div className="total-fullscreen-cover" onClick={() => setFullScreenImage(null)}>
          <span className="close-fullscreen-btn">&times;</span>
          <img src={fullScreenImage} alt="Full screen preview" className="full-screen-img" />
        </div>
      )}
    </div>
  );
}
