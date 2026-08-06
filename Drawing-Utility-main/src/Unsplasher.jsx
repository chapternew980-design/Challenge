import React, { useState } from 'react';
import './App.css'; // Importing the modern styles below

export default function UnsplashImageFetcher() {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [zanra, setZanra] = useState('');

  // Updated with your actual Unsplash Access Key
  const ACCESS_KEY = '_XfKJaR2bkrcDMV1VjvRIlHX9V91NWf5O7HOMgMbeqk';

  const fetchImage = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Uses 'drawing' as default search if the input field is empty
      const queryParam = zanra.trim() !== '' ? zanra : 'drawing';
      const response = await fetch(
        `https://api.unsplash.com/photos/random?client_id=${ACCESS_KEY}&query=${encodeURIComponent(queryParam)}`
      );
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setImageUrl(data.urls.regular); 
    } catch (err) {
      setError(err.message || 'Failed to fetch image');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h1 className="title">Drawing Inspiration</h1>
        <p className="subtitle">Fetch a random drawing or sketch from Unsplash</p>

        {/* Kept input box outside of image conditional so it stays visible */}
        <input 
          className='input' 
          onChange={(e) => setZanra(e.target.value)} 
          value={zanra} 
          type="text" 
          placeholder='What do you want to draw?'
        />
        
        <button
          onClick={fetchImage}
          disabled={loading}
          className="fetch-btn"
        >
          {loading ? 'Fetching...' : 'Get Drawing'}
        </button>

        {error && <p className="error-msg">{error}</p>}

        <div className="image-frame">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Drawing inspiration from Unsplash"
              className="display-image"
            />
          ) : (
            <div className="placeholder-text">
              <p>Type something above and click "Get Drawing"!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}