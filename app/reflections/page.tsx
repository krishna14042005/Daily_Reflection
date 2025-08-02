"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface Reflection {
  _id: string
  content: string
  date: string
  createdAt: string
  mood?: string
  tags?: string[]
}

export default function ReflectionsPage() {
  const [reflections, setReflections] = useState<Reflection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedDate, setSelectedDate] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")
  const router = useRouter()

  const [filterMood, setFilterMood] = useState("")
  const [filterTag, setFilterTag] = useState("")
  const [sortBy, setSortBy] = useState("newest")

  useEffect(() => {
    checkAuth()
    fetchReflections()
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

  const fetchReflections = async () => {
    try {
      const response = await fetch("/api/reflections")
      if (response.ok) {
        const data = await response.json()
        setReflections(data)
      } else {
        setError("Failed to fetch reflections")
      }
    } catch (error) {
      setError("An error occurred while fetching reflections")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this reflection?")) {
      return
    }

    try {
      const response = await fetch(`/api/reflections/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setReflections(reflections.filter((r) => r._id !== id))
      } else {
        setError("Failed to delete reflection")
      }
    } catch (error) {
      setError("An error occurred while deleting reflection")
    }
  }

  const handleEdit = (reflection: Reflection) => {
    setEditingId(reflection._id)
    setEditContent(reflection.content)
  }

  const handleSaveEdit = async (id: string) => {
    try {
      const response = await fetch(`/api/reflections/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: editContent }),
      })

      if (response.ok) {
        const updatedReflection = await response.json()
        setReflections(reflections.map((r) => (r._id === id ? updatedReflection : r)))
        setEditingId(null)
        setEditContent("")
      } else {
        setError("Failed to update reflection")
      }
    } catch (error) {
      setError("An error occurred while updating reflection")
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditContent("")
  }

  // Fix the filtering logic
  let filteredReflections = reflections

  // Date filtering
  if (selectedDate) {
    filteredReflections = filteredReflections.filter((r) => r.date === selectedDate)
  }

  // Mood filtering
  if (filterMood) {
    filteredReflections = filteredReflections.filter((r) => r.mood === filterMood)
  }

  // Tag filtering
  if (filterTag) {
    filteredReflections = filteredReflections.filter(
      (r) => r.tags && r.tags.some((tag) => tag.toLowerCase().includes(filterTag.toLowerCase())),
    )
  }

  // Sorting
  if (sortBy === "newest") {
    filteredReflections = [...filteredReflections].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
  } else if (sortBy === "oldest") {
    filteredReflections = [...filteredReflections].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    )
  } else if (sortBy === "longest") {
    filteredReflections = [...filteredReflections].sort((a, b) => b.content.length - a.content.length)
  } else if (sortBy === "shortest") {
    filteredReflections = [...filteredReflections].sort((a, b) => a.content.length - b.content.length)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getWordCount = (content: string) => {
    return content
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading your reflections...</p>
      </div>
    )
  }

  return (
    <div className="page-container">
      <nav className="navbar">
        <Link href="/" className="nav-brand">
          <h1 className="brand-title">Daily Reflection</h1>
        </Link>
        <div className="nav-links">
          <Link href="/" className="nav-link">
            <span className="nav-icon"></span>
            Home
          </Link>
          <Link href="/add-reflection" className="nav-link nav-link-primary">
            <span className="nav-icon"></span>
            Add Reflection
          </Link>
        </div>
      </nav>

      <main className="main-content">
        <div className="page-header animate-fade-in">
          <div className="header-content">
            <h1 className="page-title">My Reflections</h1>
          </div>
          <div className="header-decoration"></div>
        </div>

        <div className="filter-section animate-slide-in">
          <div className="filter-header">
            <h2 className="filter-title">Filter & Sort</h2>
          </div>
          <div className="filter-grid">
            <div className="filter-group">
              <label htmlFor="dateFilter" className="filter-label">
                <span className="label-icon">📅</span>
                Filter by date
              </label>
              <input
                type="date"
                id="dateFilter"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="filter-input"
              />
            </div>

            <div className="filter-group">
              <label htmlFor="moodFilter" className="filter-label">
                <span className="label-icon">😊</span>
                Filter by mood
              </label>
              <select
                id="moodFilter"
                value={filterMood}
                onChange={(e) => setFilterMood(e.target.value)}
                className="filter-select"
              >
                <option value="">All moods</option>
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

            <div className="filter-group">
              <label htmlFor="sortBy" className="filter-label">
                <span className="label-icon">🔄</span>
                Sort by
              </label>
              <select id="sortBy" value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="filter-select">
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="longest">Longest first</option>
                <option value="shortest">Shortest first</option>
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="tagFilter" className="filter-label">
                <span className="label-icon">🏷️</span>
                Filter by tag
              </label>
              <input
                type="text"
                id="tagFilter"
                value={filterTag}
                onChange={(e) => setFilterTag(e.target.value)}
                placeholder="Enter tag name..."
                className="filter-input"
              />
            </div>
          </div>

          {(selectedDate || filterMood || filterTag) && (
            <div className="active-filters animate-scale-in">
              <span className="active-filters-label">Active filters:</span>
              <div className="filter-tags">
                {selectedDate && (
                  <span className="filter-tag">
                    <span className="tag-icon">📅</span>
                    Date: {selectedDate}
                    <button onClick={() => setSelectedDate("")} className="tag-remove">
                      ×
                    </button>
                  </span>
                )}
                {filterMood && (
                  <span className="filter-tag">
                    <span className="tag-icon">😊</span>
                    Mood: {filterMood}
                    <button onClick={() => setFilterMood("")} className="tag-remove">
                      ×
                    </button>
                  </span>
                )}
                {filterTag && (
                  <span className="filter-tag">
                    <span className="tag-icon">🏷️</span>
                    Tag: {filterTag}
                    <button onClick={() => setFilterTag("")} className="tag-remove">
                      ×
                    </button>
                  </span>
                )}
              </div>
              <button
                onClick={() => {
                  setSelectedDate("")
                  setFilterMood("")
                  setFilterTag("")
                }}
                className="clear-all-btn"
              >
                Clear All
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="error-message animate-scale-in">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        {filteredReflections.length === 0 ? (
          <div className="empty-state animate-fade-in">
            <div className="empty-icon">📝</div>
            <h3 className="empty-title">No reflections found</h3>
            <p className="empty-subtitle">Start your reflection journey today</p>
            <Link href="/add-reflection" className="btn btn-primary btn-large">
              <span className="btn-icon">✨</span>
              Add Your First Reflection
            </Link>
          </div>
        ) : (
          <div className="reflections-grid">
            {filteredReflections.map((reflection, index) => (
              <div
                key={reflection._id}
                className="reflection-card animate-fade-in hover-lift"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="card-header">
                  <div className="card-meta">
                    <div className="card-date">
                      <span className="date-icon">📅</span>
                      {formatDate(reflection.createdAt)}
                    </div>
                    {reflection.mood && (
                      <div className="card-mood">
                        <span className="mood-emoji">{reflection.mood.split(" ")[0]}</span>
                        <span className="mood-text">{reflection.mood.split(" ").slice(1).join(" ")}</span>
                      </div>
                    )}
                  </div>
                  <div className="card-actions">
                    {editingId === reflection._id ? (
                      <div className="edit-actions">
                        <button onClick={() => handleSaveEdit(reflection._id)} className="btn btn-sm btn-success">
                          <span className="btn-icon">✅</span>
                          Save
                        </button>
                        <button onClick={handleCancelEdit} className="btn btn-sm btn-secondary">
                          <span className="btn-icon">❌</span>
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="view-actions">
                        <button onClick={() => handleEdit(reflection)} className="btn btn-sm btn-secondary">
                          <span className="btn-icon">✏️</span>
                          Edit
                        </button>
                        <button onClick={() => handleDelete(reflection._id)} className="btn btn-sm btn-danger">
                          <span className="btn-icon">🗑️</span>
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="card-content">
                  {editingId === reflection._id ? (
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={6}
                      className="edit-textarea"
                      placeholder="Write your reflection..."
                    />
                  ) : (
                    <p className="reflection-text">{reflection.content}</p>
                  )}
                </div>

                {reflection.tags && reflection.tags.length > 0 && (
                  <div className="card-tags">
                    {reflection.tags.map((tag, tagIndex) => (
                      <span key={tagIndex} className="tag">
                        <span className="tag-hash">#</span>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="card-footer">
                  <div className="word-count">
                    <span className="count-icon">📊</span>
                    {getWordCount(editingId === reflection._id ? editContent : reflection.content)} words
                  </div>
                  <div className="card-gradient"></div>
                </div>
              </div>
            ))}
          </div>
        )}
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

        .nav-link-primary {
          background: var(--gradient-primary);
          color: white;
        }

        .nav-link-primary:hover {
          color: white;
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
        }

        .nav-icon {
          font-size: 1rem;
        }

        .main-content {
          padding: 3rem 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .page-header {
          text-align: center;
          margin-bottom: 3rem;
          position: relative;
        }

        .header-content {
          margin-bottom: 1rem;
        }

        .page-title {
          font-family: var(--font-serif);
          font-size: 3rem;
          font-weight: 700;
          color: var(--neutral-800);
          margin-bottom: 0.5rem;
        }

        .page-subtitle {
          font-size: 1.25rem;
          color: var(--neutral-600);
          margin: 0;
        }

        .header-decoration {
          width: 120px;
          height: 4px;
          background: var(--gradient-primary);
          margin: 0 auto;
          border-radius: 2px;
        }

        .filter-section {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: var(--radius-2xl);
          padding: 2rem;
          margin-bottom: 3rem;
          box-shadow: var(--shadow-lg);
        }

        .filter-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .filter-title {
          font-family: var(--font-serif);
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--neutral-800);
          margin-bottom: 0.25rem;
        }

        .filter-subtitle {
          color: var(--neutral-600);
          font-size: 0.9rem;
        }

        .filter-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .filter-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--neutral-700);
          font-weight: 600;
          font-size: 0.9rem;
        }

        .label-icon {
          font-size: 1rem;
        }

        .filter-input,
        .filter-select {
          padding: 0.875rem 1rem;
          border: 2px solid var(--neutral-200);
          border-radius: var(--radius-lg);
          font-size: 1rem;
          background: white;
          transition: all 0.2s ease;
        }

        .filter-input:focus,
        .filter-select:focus {
          border-color: var(--primary-500);
          box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
        }

        .active-filters {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
          padding: 1.5rem;
          background: var(--primary-50);
          border-radius: var(--radius-xl);
          border: 1px solid var(--primary-200);
        }

        .active-filters-label {
          font-weight: 600;
          color: var(--primary-700);
          font-size: 0.9rem;
        }

        .filter-tags {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .filter-tag {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          background: var(--primary-100);
          color: var(--primary-800);
          border-radius: var(--radius-lg);
          font-size: 0.875rem;
          font-weight: 500;
        }

        .tag-icon {
          font-size: 0.875rem;
        }

        .tag-remove {
          background: none;
          border: none;
          color: var(--primary-600);
          cursor: pointer;
          font-size: 1rem;
          padding: 0;
          margin-left: 0.25rem;
        }

        .tag-remove:hover {
          color: var(--primary-800);
        }

        .clear-all-btn {
          padding: 0.5rem 1rem;
          background: var(--error-500);
          color: white;
          border: none;
          border-radius: var(--radius-lg);
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .clear-all-btn:hover {
          background: var(--error-600);
          transform: translateY(-1px);
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 1.5rem;
          background: rgba(239, 68, 68, 0.1);
          color: var(--error-500);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: var(--radius-xl);
          margin-bottom: 2rem;
          font-weight: 500;
        }

        .error-icon {
          font-size: 1.25rem;
        }

        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(10px);
          border-radius: var(--radius-2xl);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .empty-title {
          font-family: var(--font-serif);
          font-size: 1.75rem;
          font-weight: 600;
          color: var(--neutral-800);
          margin-bottom: 0.5rem;
        }

        .empty-subtitle {
          color: var(--neutral-600);
          font-size: 1.125rem;
          margin-bottom: 2rem;
        }

        .reflections-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 2rem;
        }

        .reflection-card {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: var(--radius-2xl);
          padding: 2rem;
          box-shadow: var(--shadow-md);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .reflection-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: var(--gradient-primary);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.5rem;
          gap: 1rem;
        }

        .card-meta {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .card-date {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--neutral-600);
          font-weight: 500;
          font-size: 0.9rem;
        }

        .date-icon {
          font-size: 0.875rem;
        }

        .card-mood {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          background: var(--secondary-50);
          border-radius: var(--radius-lg);
          border: 1px solid var(--secondary-200);
        }

        .mood-emoji {
          font-size: 1.125rem;
        }

        .mood-text {
          color: var(--secondary-700);
          font-weight: 500;
          font-size: 0.875rem;
          text-transform: capitalize;
        }

        .card-actions {
          display: flex;
          gap: 0.5rem;
        }

        .edit-actions,
        .view-actions {
          display: flex;
          gap: 0.5rem;
        }

        .card-content {
          margin-bottom: 1.5rem;
        }

        .reflection-text {
          color: var(--neutral-700);
          line-height: 1.7;
          font-size: 1rem;
          margin: 0;
          white-space: pre-wrap;
        }

        .edit-textarea {
          width: 100%;
          padding: 1rem;
          border: 2px solid var(--neutral-200);
          border-radius: var(--radius-lg);
          font-family: inherit;
          font-size: 1rem;
          line-height: 1.6;
          resize: vertical;
          min-height: 120px;
          transition: border-color 0.2s ease;
        }

        .edit-textarea:focus {
          border-color: var(--primary-500);
          box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
        }

        .card-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
        }

        .tag {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.375rem 0.75rem;
          background: var(--neutral-100);
          color: var(--neutral-700);
          border-radius: var(--radius-lg);
          font-size: 0.875rem;
          font-weight: 500;
        }

        .tag-hash {
          color: var(--primary-500);
          font-weight: 600;
        }

        .card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: relative;
        }

        .word-count {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--neutral-500);
          font-size: 0.875rem;
          font-weight: 500;
        }

        .count-icon {
          font-size: 0.875rem;
        }

        .card-gradient {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 60px;
          height: 60px;
          background: var(--gradient-primary);
          opacity: 0.1;
          border-radius: 50%;
          transform: translate(30px, 30px);
        }

        .btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: var(--radius-lg);
          font-weight: 600;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 0.875rem;
        }

        .btn-sm {
          padding: 0.375rem 0.75rem;
          font-size: 0.8rem;
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

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
        }

        .btn-secondary {
          background: var(--neutral-100);
          color: var(--neutral-700);
          border: 1px solid var(--neutral-200);
        }

        .btn-secondary:hover {
          background: var(--neutral-200);
          transform: translateY(-1px);
        }

        .btn-success {
          background: var(--success-500);
          color: white;
        }

        .btn-success:hover {
          background: var(--success-600);
          transform: translateY(-1px);
        }

        .btn-danger {
          background: var(--error-500);
          color: white;
        }

        .btn-danger:hover {
          background: var(--error-600);
          transform: translateY(-1px);
        }

        .btn-icon {
          font-size: 1rem;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 100vh;
          gap: 1rem;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid var(--neutral-200);
          border-top: 3px solid var(--primary-500);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .loading-text {
          color: var(--neutral-600);
          font-size: 1.125rem;
          font-weight: 500;
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
            font-size: 2.5rem;
          }

          .filter-grid {
            grid-template-columns: 1fr;
          }

          .reflections-grid {
            grid-template-columns: 1fr;
          }

          .card-header {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }

          .card-actions {
            align-self: flex-end;
          }

          .active-filters {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
        }
      `}</style>
    </div>
  )
}
