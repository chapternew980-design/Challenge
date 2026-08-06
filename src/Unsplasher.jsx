import React, { useState } from 'react';
import './App.css'; 

export default function UnsplashImageFetcher() {
  const [images, setImages] = useState([]); // Array to hold up to 30 images
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [zanra, setZanra] = useState('');
  
  // UI Controls
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [fullScreenImage, setFullScreenImage] = useState(null);

  const ACCESS_KEY = '_XfKJaR2bkrcDMV1VjvRIlHX9V91NWf5O7HOMgMbeqk';

  const fetchImages = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const queryParam = zanra.trim() !== '' ? zanra : 'drawing';
      
      // Fetches up to 30 images (Unsplash API maximum per page)
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

  return (
    <div className="container">
      {/* 1. SIDEBAR TOGGLE BUTTON & DRAWER */}
      <button 
        className="menu-btn" 
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        ☰ Menu
      </button>

      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <button className="close-sidebar-btn" onClick={() => setSidebarOpen(false)}>
          ×
        </button>
        <h2>Drawing Menu</h2>
        <p>Explore ideas and reference sketches.</p>
      </div>

      {/* 2. MAIN CARD UI */}
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
            onClick={fetchImages}
            disabled={loading}
            className="fetch-btn"
          >
            {loading ? 'Fetching...' : 'Get Drawings'}
          </button>
        </div>

        {error && <p className="error-msg">{error}</p>}

        {/* 3. DISPLAY GRID FOR MAX IMAGES */}
        <div className="image-grid">
          {images.length > 0 ? (
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
            <div className="placeholder-text">
              <p>Type something above and click "Get Drawings" to load results!</p>
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
