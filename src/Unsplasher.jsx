import React, { useState, useEffect } from 'react';
import './App.css'; 

export default function UnsplashImageFetcher() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [zanra, setZanra] = useState('');
  
  // UI Controls
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [fullScreenImage, setFullScreenImage] = useState(null);

  const ACCESS_KEY = '_XfKJaR2bkrcDMV1VjvRIlHX9V91NWf5O7HOMgMbeqk';

  // Function to fetch images (Search or Random)
  const fetchImages = async (searchTerm = '') => {
    setLoading(true);
    setError(null);
    
    try {
      const queryParam = searchTerm || zanra.trim() || 'sketch';
      
      // Fetches 30 images from Unsplash
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

  // 3. AUTO-LOAD 30 RANDOM IMAGES WHEN THE PAGE FIRST OPENS
  useEffect(() => {
    fetchImages('drawing inspiration');
  }, []);

  return (
    <div className="container">
      {/* 1. SIDEBAR MENU */}
      <button 
        className="menu-btn" 
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        ☰
      </button>

      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <button className="close-sidebar-btn" onClick={() => setSidebarOpen(false)}>
          ×
        </button>
        <h2>Drawing Menu</h2>
        <p>Explore ideas and reference sketches.</p>
      </div>

      {/* 2. MAIN CARD */}
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

        {/* 3. IMAGE GRID & SKELETON LOADING SYSTEM */}
        <div className="image-grid">
          {loading ? (
            // SHOW 12 FAKE SKELETON CARDS WHILE LOADING (YouTube Style)
            Array.from({ length: 12 }).map((_, index) => (
              <div key={index} className="skeleton-card">
                <div className="skeleton-image"></div>
              </div>
            ))
          ) : images.length > 0 ? (
            // SHOW ACTUAL IMAGES WHEN READY
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
            // 1. CENTERED PLACEHOLDER TEXT
            <div className="placeholder-wrapper">
              <p className="placeholder-text">Type something above and click "Get Drawings" to load results!</p>
            </div>
          )}
        </div>
      </div>

      {/* 4. FULL-SCREEN LIGHTBOX MODAL */}
      {fullScreenImage && (
        <div className="modal-overlay" onClick={() => setFullScreenImage(null)}>
          <span className="close-modal-btn">&times;</span>
          <img src={fullScreenImage} alt="Full screen reference view" className="modal-image" />
        </div>
      )}
    </div>
  );
}
