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
        <button className="close-sidebar-btn" onClick={() => setSidebarOpen(false)}>
          ×
        </button>
        <h2 className="sidebar-title">Navigation</h2>
        
        {/* Ready-to-Link Buttons */}
        <nav className="sidebar-nav">
          <button className="nav-btn active">🏠 Home / Search</button>
          <button className="nav-btn">⭐ Favorites</button>
          <button className="nav-btn">📂 Categories</button>
          <button className="nav-btn">ℹ️ About Us</button>
        </nav>
      </div>

      {/* 3. MAIN CONTENT AREA */}
      <main className="main-content">
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
              placeholder="What do you want to draw?"
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

          {/* 4. IMAGE GRID & SKELETON LOADING */}
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
      </main>

      {/* 5. OVERRIDING FULL-SCREEN COVER MODAL */}
      {fullScreenImage && (
        <div className="total-fullscreen-cover" onClick={() => setFullScreenImage(null)}>
          <span className="close-fullscreen-btn">&times;</span>
          <img src={fullScreenImage} alt="Full screen preview" className="full-screen-img" />
        </div>
      )}
    </div>
  );
}
