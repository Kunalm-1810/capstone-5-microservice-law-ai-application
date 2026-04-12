import { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [tab, setTab] = useState("chat");
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [contract, setContract] = useState("");
  const [review, setReview] = useState("");
  const [reviewing, setReviewing] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, loading]);

  const sendMessage = async () => {
    if (!message.trim()) return;
    setError("");
    const newChat = [...chat, { type: "user", text: message }];
    setChat(newChat);
    setMessage("");
    setLoading(true);
    try {
      const res = await axios.post("/chat", { message });
      setChat([...newChat, { type: "bot", text: res.data.reply }]);
    } catch {
      setError("Failed to get response. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const reviewContract = async () => {
    if (!contract.trim()) return;
    setReview("");
    setReviewing(true);
    try {
      const res = await axios.post("/review", { contract });
      setReview(res.data.review);
    } catch {
      setReview("Failed to review contract. Make sure the backend is running.");
    } finally {
      setReviewing(false);
    }
  };

  const handleKey = (e) => e.key === "Enter" && sendMessage();

  const quickTopics = [
    { label: "Fundamental Rights", emoji: "📜", q: "What are my Fundamental Rights?" },
    { label: "Criminal Law & FIR", emoji: "⚖️", q: "Explain Criminal Law and FIR" },
    { label: "Consumer Rights", emoji: "🛒", q: "What are Consumer Rights in India?" },
    { label: "File a Court Case", emoji: "🏛️", q: "How to file a case in court?" },
  ];

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-icon">⚖️</div>
        <h1>Know Your Law AI</h1>
        <p>Your AI-powered Indian Legal Assistant 🇮🇳</p>
      </header>

      <div className="tabs">
        <button className={tab === "chat" ? "active" : ""} onClick={() => setTab("chat")}>💬 Ask a Question</button>
        <button className={tab === "review" ? "active" : ""} onClick={() => setTab("review")}>📄 Review Contract</button>
      </div>

      {tab === "chat" && (
        <>
          <div className="quick-buttons">
            {quickTopics.map((t) => (
              <button key={t.label} onClick={() => setMessage(t.q)}>
                <span className="q-emoji">{t.emoji}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>

          <div className="chat-box">
            {chat.length === 0 && (
              <div className="placeholder">
                <div className="placeholder-icon">⚖️</div>
                <p>Ask anything about Indian law</p>
                <small>Try one of the quick topics above</small>
              </div>
            )}
            {chat.map((c, i) => (
              <div key={i} className={`message ${c.type}`}>
                {c.type === "bot" && <div className="avatar bot-avatar">⚖️</div>}
                <span>{c.text}</span>
                {c.type === "user" && <div className="avatar user-avatar">👤</div>}
              </div>
            ))}
            {loading && (
              <div className="message bot">
                <div className="avatar bot-avatar">⚖️</div>
                <span className="typing"><span /><span /><span /></span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {error && <p className="error">⚠️ {error}</p>}

          <div className="input-area">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask about Indian law..."
            />
            <button onClick={sendMessage} disabled={loading}>
              {loading ? "..." : "➤"}
            </button>
          </div>
        </>
      )}

      {tab === "review" && (
        <div className="review-section">
          <div className="review-info">
            <span>📌</span>
            <p>Paste your contract or legal document. AI will identify risky clauses and explain them in simple language.</p>
          </div>
          <textarea
            value={contract}
            onChange={(e) => setContract(e.target.value)}
            placeholder="Paste contract text here..."
            rows={10}
          />
          <button onClick={reviewContract} disabled={reviewing}>
            {reviewing ? "⏳ Reviewing..." : "🔍 Review Contract"}
          </button>
          {review && (
            <div className="review-result">
              <h3>📋 Review Result</h3>
              <p>{review}</p>
            </div>
          )}
        </div>
      )}

      <footer className="app-footer">
        ⚠️ This app provides legal information, not legal advice.
      </footer>
    </div>
  );
}

export default App;
