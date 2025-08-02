"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function AddReflectionPage() {
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [wordCount, setWordCount] = useState(0)
  const router = useRouter()
  const [mood, setMood] = useState("")
  const [tags, setTags] = useState("")
  const [selectedPrompt, setSelectedPrompt] = useState<any>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    const words = content
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0)
    setWordCount(words.length)
  }, [content])

  useEffect(() => {
    const savedPrompt = localStorage.getItem("selectedPrompt")
    if (savedPrompt) {
      setSelectedPrompt(JSON.parse(savedPrompt))
      localStorage.removeItem("selectedPrompt")
    }
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me")
      if (!response.ok) {
        router.push("/login")
      }
    } catch (error) {
      router.push("/login")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) {
      setError("Please write your reflection")
      return
    }

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/reflections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: content.trim(),
          mood: mood || null,
          tags: tags.trim() ? tags.split(",").map((tag) => tag.trim()) : [],
        }),
      })

      if (response.ok) {
        setSuccess("Reflection saved successfully! 🎉")
        setTimeout(() => {
          router.push("/reflections")
        }, 2000)
      } else {
        const data = await response.json()
        setError(data.error || "Failed to save reflection")
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container">
      <nav className="navbar">
        <Link href="/" className="nav-brand">
          <h1 className="brand-title">Daily Reflection</h1>
          <span className="brand-subtitle"></span>
        </Link>
        <div className="nav-links">
          <Link href="/" className="nav-link">
            <span className="nav-icon"></span>
            Home
          </Link>
          <Link href="/reflections" className="nav-link">
            <span className="nav-icon"></span>
            My Reflections
          </Link>
          <Link href="/prompts" className="nav-link">
            <span className="nav-icon"></span>
            Prompts
          </Link>
        </div>
      </nav>

      <main className="main-content">
        <div className="page-header animate-fade-in">
          <div className="header-content">
            <h1 className="page-title">Add Today's Reflection</h1>
          </div>
          <div className="header-decoration"></div>
        </div>

        {selectedPrompt && (
          <div className="selected-prompt animate-scale-in">
            <div className="prompt-header">
              <div className="prompt-icon">💡</div>
              <h3 className="prompt-title">Reflection Prompt</h3>
              <button onClick={() => setSelectedPrompt(null)} className="close-prompt-btn">
                <span>×</span>
              </button>
            </div>
            <div className="prompt-content">
              <p className="prompt-text">{selectedPrompt.text}</p>
              <span className="prompt-category">
                <span className="category-icon"></span>
                {selectedPrompt.category}
              </span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="reflection-form animate-slide-in">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="mood" className="form-label">
                <span className="label-icon"></span>
                How are you feeling today?
              </label>
              <select id="mood" value={mood} onChange={(e) => setMood(e.target.value)} className="form-select">
                <option value="">Select your mood</option>
                <option value="😊 Happy">😊 Happy</option>
                <option value="😌 Calm">😌 Calm</option>
                <option value="😔 Sad">😔 Sad</option>
                <option value="😰 Anxious">😰 Anxious</option>
                <option value="😤 Frustrated">😤 Frustrated</option>
                <option value="🤔 Thoughtful">🤔 Thoughtful</option>
                <option value="😴 Tired">😴 Tired</option>
                <option value="🎉 Excited">🎉 Excited</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="tags" className="form-label">
                <span className="label-icon"></span>
                Tags (comma-separated)
              </label>
              <input
                type="text"
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="content" className="form-label">
              <span className="label-icon"></span>
              Your Reflection
            </label>
            <div className="textarea-container">
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={12}
                required
                className="form-textarea"
              />
              <div className="textarea-footer">
                <div className="word-count">
                  <span className="count-icon"></span>
                  
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="message error-message animate-scale-in">
              <span className="message-icon">⚠️</span>
              {error}
            </div>
          )}

          {success && (
            <div className="message success-message animate-scale-in">
              <span className="message-icon">✅</span>
              {success}
            </div>
          )}

          <div className="form-actions">
            <Link href="/reflections" className="btn btn-secondary btn-large">
              <span className="btn-icon"></span>
              Cancel
            </Link>
            <button type="submit" disabled={loading} className="btn btn-primary btn-large">
              <span className="btn-icon">{loading ? "⏳" : ""}</span>
              {loading ? "Saving..." : "Save Reflection"}
            </button>
          </div>
        </form>
      </main>

      <style jsx>{`
        .page-container {
          min-height: 100vh;
          background: var(--gradient-subtle);
        }

        .navbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 2rem;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .nav-brand {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          text-decoration: none;
        }

        .brand-title {
          font-family: var(--font-serif);
          font-size: 1.75rem;
          font-weight: 600;
          background: var(--gradient-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0;
        }

        .brand-subtitle {
          font-size: 0.875rem;
          color: var(--neutral-500);
          font-weight: 400;
        }

        .nav-links {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          text-decoration: none;
          color: var(--neutral-700);
          font-weight: 500;
          border-radius: var(--radius-lg);
          transition: all 0.2s ease;
        }

        .nav-link:hover {
          color: var(--primary-700);
          transform: translateY(-1px);
        }

        .nav-icon {
          font-size: 1rem;
        }

        .main-content {
          padding: 3rem 2rem;
          max-width: 800px;
          margin: 0 auto;
        }

        .page-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .header-content {
          margin-bottom: 1rem;
        }

        .page-title {
          font-family: var(--font-serif);
          font-size: 2.5rem;
          font-weight: 700;
          color: var(--neutral-800);
          margin-bottom: 0.5rem;
        }

        .page-subtitle {
          font-size: 1.125rem;
          color: var(--neutral-600);
          margin: 0;
        }

        .header-decoration {
          width: 100px;
          height: 4px;
          background: var(--gradient-primary);
          margin: 0 auto;
          border-radius: 2px;
        }

        .selected-prompt {
          background: var(--gradient-primary);
          color: white;
          border-radius: var(--radius-2xl);
          padding: 2rem;
          margin-bottom: 2rem;
          box-shadow: var(--shadow-xl);
        }

        .prompt-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .prompt-icon {
          font-size: 1.5rem;
        }

        .prompt-title {
          flex: 1;
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .close-prompt-btn {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s ease;
        }

        .close-prompt-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .prompt-content {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .prompt-text {
          font-size: 1.125rem;
          line-height: 1.6;
          margin: 0;
        }

        .prompt-category {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.2);
          padding: 0.5rem 1rem;
          border-radius: var(--radius-lg);
          font-size: 0.875rem;
          font-weight: 500;
          text-transform: capitalize;
          width: fit-content;
        }

        .category-icon {
          font-size: 0.875rem;
        }

        .reflection-form {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: var(--radius-2xl);
          padding: 2.5rem;
          box-shadow: var(--shadow-xl);
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .form-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--neutral-800);
          font-weight: 600;
          font-size: 1rem;
        }

        .label-icon {
          font-size: 1.125rem;
        }

        .form-input,
        .form-select {
          padding: 1rem 1.25rem;
          border: 2px solid var(--neutral-200);
          border-radius: var(--radius-xl);
          font-size: 1rem;
          background: white;
          transition: all 0.2s ease;
        }

        .form-input:focus,
        .form-select:focus {
          border-color: var(--primary-500);
          box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
        }

        .textarea-container {
          position: relative;
        }

        .form-textarea {
          width: 100%;
          padding: 1.25rem;
          border: 2px solid var(--neutral-200);
          border-radius: var(--radius-xl);
          font-size: 1rem;
          font-family: inherit;
          line-height: 1.7;
          resize: vertical;
          min-height: 300px;
          background: white;
          transition: all 0.2s ease;
        }

        .form-textarea:focus {
          border-color: var(--primary-500);
          box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
        }

        .textarea-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 0.75rem;
          padding: 0 0.5rem;
        }

        .word-count {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--neutral-600);
          font-size: 0.9rem;
          font-weight: 500;
        }

        .count-icon {
          font-size: 0.875rem;
        }

        .writing-tip {
          color: var(--primary-600);
          font-size: 0.875rem;
          font-weight: 500;
        }

        .message {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 1.5rem;
          border-radius: var(--radius-xl);
          font-weight: 500;
          margin-bottom: 2rem;
        }

        .error-message {
          background: rgba(239, 68, 68, 0.1);
          color: var(--error-500);
          border: 1px solid rgba(239, 68, 68, 0.2);
        }

        .success-message {
          background: rgba(16, 185, 129, 0.1);
          color: var(--success-500);
          border: 1px solid rgba(16, 185, 129, 0.2);
        }

        .message-icon {
          font-size: 1.25rem;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.875rem 1.5rem;
          border: none;
          border-radius: var(--radius-xl);
          font-weight: 600;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 1rem;
        }

        .btn-large {
          padding: 1rem 2rem;
          font-size: 1.125rem;
        }

        .btn-primary {
          background: var(--gradient-primary);
          color: white;
          box-shadow: var(--shadow-md);
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: var(--shadow-xl);
        }

        .btn-primary:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .btn-secondary {
          background: rgba(255, 255, 255, 0.8);
          color: var(--neutral-700);
          border: 1px solid rgba(255, 255, 255, 0.3);
          backdrop-filter: blur(10px);
        }

        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.95);
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
        }

        .btn-icon {
          font-size: 1.125rem;
        }

        @media (max-width: 768px) {
          .navbar {
            flex-direction: column;
            gap: 1rem;
            padding: 1rem;
          }

          .main-content {
            padding: 2rem 1rem;
          }

          .page-title {
            font-size: 2rem;
          }

          .form-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .form-actions {
            flex-direction: column;
          }

          .textarea-footer {
            flex-direction: column;
            gap: 0.5rem;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  )
}
