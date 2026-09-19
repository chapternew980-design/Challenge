import { useState } from 'react'
import './App.css'

function App() {
  // Page Navigation State ('notes' or 'chat')
  const [activeTab, setActiveTab] = useState('notes')

  // Sample Notes State
  const [notes, setNotes] = useState([
    { id: 1, title: 'Shopping List', content: 'Milk, Eggs, Bread', date: 'Today' },
    { id: 2, title: 'Project Ideas', content: 'Build a Samsung Notes clone using React', date: 'Yesterday' }
  ])

  // Local AI Chat State
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Hello! I am your local AI assistant. How can I help you today?' }
  ])
  const [inputPrompt, setInputPrompt] = useState('')
  const [loading, setLoading] = useState(false)

  // Function to Send Message to Local AI API
  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!inputPrompt.trim() || loading) return

    const userMessage = { sender: 'user', text: inputPrompt }
    setMessages((prev) => [...prev, userMessage])
    setInputPrompt('')
    setLoading(true)

    try {
      // Default endpoint for Ollama API running locally
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3', // Replace with your local model name (e.g., 'mistral', 'phi3')
          prompt: inputPrompt,
          stream: false
        })
      })

      const data = await response.json()
      const aiReply = data.response || 'No response received from local AI.'

      setMessages((prev) => [...prev, { sender: 'ai', text: aiReply }])
    } catch (error) {
      console.error('Error fetching local AI:', error)
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: '⚠️ Unable to connect to your local AI API. Make sure your local AI server is running.' }
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <h1 className="logo">Samsung Workspace</h1>
        <div className="header-icons">
          <button className="icon-btn">🔍 Search</button>
          <button className="icon-btn">⋮ Options</button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="nav-tabs">
        <button
          className={`tab-btn ${activeTab === 'notes' ? 'active' : ''}`}
          onClick={() => setActiveTab('notes')}
        >
          📝 Notes
        </button>
        <button
          className={`tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          🤖 Local AI Chat
        </button>
      </div>

      {/* Notes View */}
      {activeTab === 'notes' && (
        <main className="main-content">
          <div className="notes-grid">
            {notes.map((note) => (
              <div key={note.id} className="note-card">
                <h3 className="note-title">{note.title}</h3>
                <p className="note-body">{note.content}</p>
                <span className="note-date">{note.date}</span>
              </div>
            ))}
          </div>
          <button className="fab">+</button>
        </main>
      )}

      {/* AI Chat View */}
      {activeTab === 'chat' && (
        <main className="main-content">
          <div className="chat-container">
            <div className="chat-box">
              {messages.map((msg, index) => (
                <div key={index} className={`message ${msg.sender}`}>
                  {msg.text}
                </div>
              ))}
              {loading && <div className="message ai">Thinking...</div>}
            </div>

            <form onSubmit={handleSendMessage} className="chat-input-form">
              <input
                type="text"
                className="chat-input"
                placeholder="Ask your local AI..."
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
              />
              <button type="submit" className="send-btn" disabled={loading}>
                Send
              </button>
            </form>
          </div>
        </main>
      )}
    </div>
  )
}

export default App
