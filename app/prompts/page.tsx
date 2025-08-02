"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface Prompt {
  _id: string
  text: string
  category: string
  isDefault: boolean
  createdAt: string
}

const DEFAULT_PROMPTS = [
  { text: "What are you most grateful for today?", category: "gratitude" },
  { text: "What challenged you today and how did you overcome it?", category: "growth" },
  { text: "How did you show kindness to yourself or others today?", category: "kindness" },
  { text: "What emotions did you experience today? How did they guide your actions?", category: "emotions" },
  { text: "What progress did you make toward your goals today?", category: "goals" },
  { text: "What did you learn about yourself today?", category: "self-discovery" },
  { text: "How did you take care of your physical and mental health today?", category: "wellness" },
  { text: "What moment today brought you the most joy?", category: "joy" },
  { text: "What would you do differently if you could relive today?", category: "reflection" },
  { text: "How did you connect with others today?", category: "relationships" },
]

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [newPrompt, setNewPrompt] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("gratitude")
  const [filterCategory, setFilterCategory] = useState("all")
  const [dailyPrompt, setDailyPrompt] = useState<Prompt | null>(null)
  const router = useRouter()

  const categories = [
    { value: "gratitude", label: "Gratitude" },
    { value: "growth", label: "Personal Growth" },
    { value: "emotions", label: "Emotions" },
    { value: "goals", label: "Goals & Productivity" },
    { value: "relationships", label: "Relationships" },
    { value: "wellness", label: "Health & Wellness" },
    { value: "self-discovery", label: "Self-Discovery" },
    { value: "kindness", label: "Kindness" },
    { value: "joy", label: "Joy & Happiness" },
    { value: "reflection", label: "General Reflection" },
  ]

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

  const fetchPrompts = async () => {
    try {
      const response = await fetch("/api/prompts")
      if (response.ok) {
        const data = await response.json()
        setPrompts(data)
      } else {
        setError("Failed to fetch prompts")
      }
    } catch (error) {
      setError("An error occurred while fetching prompts")
    } finally {
      setLoading(false)
    }
  }

  const getDailyPrompt = () => {
    const today = new Date().toDateString()
    const savedPrompt = localStorage.getItem("dailyPrompt")
    const savedDate = localStorage.getItem("dailyPromptDate")

    if (savedPrompt && savedDate === today) {
      setDailyPrompt(JSON.parse(savedPrompt))
    } else {
      // Generate a new daily prompt
      const randomPrompt = DEFAULT_PROMPTS[Math.floor(Math.random() * DEFAULT_PROMPTS.length)]
      const prompt = {
        _id: "daily",
        text: randomPrompt.text,
        category: randomPrompt.category,
        isDefault: true,
        createdAt: new Date().toISOString(),
      }
      setDailyPrompt(prompt)
      localStorage.setItem("dailyPrompt", JSON.stringify(prompt))
      localStorage.setItem("dailyPromptDate", today)
    }
  }

  const handleAddPrompt = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPrompt.trim()) return

    try {
      const response = await fetch("/api/prompts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: newPrompt.trim(),
          category: selectedCategory,
        }),
      })

      if (response.ok) {
        const prompt = await response.json()
        setPrompts([...prompts, prompt])
        setNewPrompt("")
        setSelectedCategory("gratitude")
      } else {
        const data = await response.json()
        setError(data.error || "Failed to add prompt")
      }
    } catch (error) {
      setError("An error occurred while adding prompt")
    }
  }

  const handleDeletePrompt = async (id: string) => {
    if (!confirm("Are you sure you want to delete this prompt?")) {
      return
    }

    try {
      const response = await fetch(`/api/prompts/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setPrompts(prompts.filter((p) => p._id !== id))
      } else {
        setError("Failed to delete prompt")
      }
    } catch (error) {
      setError("An error occurred while deleting prompt")
    }
  }

  const usePromptForReflection = (prompt: Prompt) => {
    localStorage.setItem("selectedPrompt", JSON.stringify(prompt))
    router.push("/add-reflection")
  }

  const filteredPrompts = filterCategory === "all" ? prompts : prompts.filter((p) => p.category === filterCategory)

  useEffect(() => {
    checkAuth()
    fetchPrompts()
    getDailyPrompt()
  }, [])

  if (loading) {
    return <div className="loading">Loading prompts...</div>
  }

  return (
    <div className="container">
      <nav className="navbar">
        <Link href="/" className="logo">
          Daily Reflection
        </Link>
        <div className="nav-links">
          <Link href="/">Home</Link>
          <Link href="/reflections">My Reflections</Link>
          <Link href="/add-reflection">Add Reflection</Link>
          <Link href="/calendar">Calendar</Link>
          <Link href="/stats">Statistics</Link>
        </div>
      </nav>

      <main className="main-content">
        <h1>Reflection Prompts</h1>

        {error && <div className="error">{error}</div>}

        {dailyPrompt && (
          <div className="daily-prompt">
            <div className="daily-prompt-header">
              <h2>🌟 Today's Prompt</h2>
              <span className="category-badge">{dailyPrompt.category}</span>
            </div>
            <p className="prompt-text">{dailyPrompt.text}</p>
            <button onClick={() => usePromptForReflection(dailyPrompt)} className="btn btn-primary">
              Use This Prompt
            </button>
          </div>
        )}

        <div className="add-prompt-section">
          <h2>Add Custom Prompt</h2>
          <form onSubmit={handleAddPrompt} className="add-prompt-form">
            <div className="form-row">
              <div className="form-group">
                <input
                  type="text"
                  value={newPrompt}
                  onChange={(e) => setNewPrompt(e.target.value)}
                  placeholder="Enter your custom reflection prompt..."
                  required
                />
              </div>
              <div className="form-group">
                <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn btn-primary">
                Add Prompt
              </button>
            </div>
          </form>
        </div>

        <div className="prompts-section">
          <div className="section-header">
            <h2>All Prompts</h2>
            <div className="filter-group">
              <label htmlFor="categoryFilter">Filter by category:</label>
              <select id="categoryFilter" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="prompts-grid">
            {filteredPrompts.map((prompt) => (
              <div key={prompt._id} className="prompt-card">
                <div className="prompt-header">
                  <span className="category-badge">{prompt.category}</span>
                  {!prompt.isDefault && (
                    <button onClick={() => handleDeletePrompt(prompt._id)} className="delete-btn">
                      ×
                    </button>
                  )}
                </div>
                <p className="prompt-text">{prompt.text}</p>
                <button onClick={() => usePromptForReflection(prompt)} className="btn btn-secondary">
                  Use This Prompt
                </button>
              </div>
            ))}
          </div>

          {filteredPrompts.length === 0 && (
            <div className="empty-state">
              <p>No prompts found for the selected category.</p>
            </div>
          )}
        </div>
      </main>

      <style jsx>{`
        .container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 0 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .navbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 0;
          border-bottom: 1px solid #e0e0e0;
          margin-bottom: 40px;
        }

        .logo {
          font-size: 1.5rem;
          font-weight: bold;
          color: #333;
          text-decoration: none;
        }

        .nav-links {
          display: flex;
          gap: 20px;
        }

        .nav-links a {
          text-decoration: none;
          color: #666;
          font-weight: 500;
          transition: color 0.2s;
        }

        .nav-links a:hover {
          color: #007bff;
        }

        .main-content {
          padding: 20px 0;
        }

        .main-content h1 {
          color: #333;
          margin-bottom: 30px;
          text-align: center;
        }

        .error {
          color: #dc3545;
          margin-bottom: 20px;
          padding: 15px;
          background: #f8d7da;
          border: 1px solid #f5c6cb;
          border-radius: 6px;
        }

        .daily-prompt {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          border-radius: 12px;
          margin-bottom: 40px;
          text-align: center;
        }

        .daily-prompt-header {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 15px;
          margin-bottom: 20px;
        }

        .daily-prompt-header h2 {
          margin: 0;
          font-size: 1.5rem;
        }

        .prompt-text {
          font-size: 1.2rem;
          line-height: 1.6;
          margin-bottom: 25px;
        }

        .category-badge {
          background: rgba(255, 255, 255, 0.2);
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 500;
          text-transform: capitalize;
        }

        .add-prompt-section {
          background: white;
          padding: 30px;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          margin-bottom: 40px;
        }

        .add-prompt-section h2 {
          color: #333;
          margin-bottom: 20px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr auto auto;
          gap: 15px;
          align-items: end;
        }

        .form-group input,
        .form-group select {
          width: 100%;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 16px;
          box-sizing: border-box;
        }

        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: #007bff;
        }

        .prompts-section {
          background: white;
          padding: 30px;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .section-header h2 {
          color: #333;
          margin: 0;
        }

        .filter-group {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .filter-group label {
          color: #666;
          font-weight: 500;
        }

        .filter-group select {
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }

        .prompts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }

        .prompt-card {
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 20px;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .prompt-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .prompt-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .prompt-card .category-badge {
          background: #f0f0f0;
          color: #666;
        }

        .delete-btn {
          background: #dc3545;
          color: white;
          border: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .delete-btn:hover {
          background: #c82333;
        }

        .prompt-card .prompt-text {
          color: #333;
          line-height: 1.6;
          margin-bottom: 20px;
        }

        .btn {
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          display: inline-block;
          text-align: center;
          transition: all 0.2s;
        }

        .btn-primary {
          background: #007bff;
          color: white;
        }

        .btn-primary:hover {
          background: #0056b3;
        }

        .btn-secondary {
          background: #6c757d;
          color: white;
        }

        .btn-secondary:hover {
          background: #545b62;
        }

        .empty-state {
          text-align: center;
          padding: 40px;
          color: #666;
        }

        .loading {
          text-align: center;
          padding: 60px 0;
          color: #666;
          font-size: 1.2rem;
        }

        @media (max-width: 768px) {
          .navbar {
            flex-direction: column;
            gap: 15px;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .section-header {
            flex-direction: column;
            gap: 15px;
            align-items: flex-start;
          }

          .prompts-grid {
            grid-template-columns: 1fr;
          }

          .daily-prompt-header {
            flex-direction: column;
            gap: 10px;
          }
        }
      `}</style>
    </div>
  )
}
