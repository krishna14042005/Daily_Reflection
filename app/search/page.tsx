"use client"

import type React from "react"

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

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Reflection[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
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

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setLoading(true)
    setHasSearched(true)

    try {
      const response = await fetch(`/api/reflections/search?q=${encodeURIComponent(searchQuery)}`)
      if (response.ok) {
        const results = await response.json()
        setSearchResults(results)
      } else {
        console.error("Search failed")
      }
    } catch (error) {
      console.error("Search error:", error)
    } finally {
      setLoading(false)
    }
  }

  const highlightText = (text: string, query: string) => {
    if (!query) return text

    const regex = new RegExp(`(${query})`, "gi")
    const parts = text.split(regex)

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="highlight">
          {part}
        </mark>
      ) : (
        part
      ),
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
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
          <Link href="/stats">Statistics</Link>
        </div>
      </nav>

      <main className="main-content">
        <h1>Search Your Reflections</h1>

        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-group">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your reflections..."
              className="search-input"
            />
            <button type="submit" disabled={loading} className="search-button">
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
        </form>

        {hasSearched && (
          <div className="search-results">
            <h2>
              {searchResults.length > 0
                ? `Found ${searchResults.length} reflection${searchResults.length !== 1 ? "s" : ""}`
                : "No reflections found"}
            </h2>

            {searchResults.length > 0 && (
              <div className="results-list">
                {searchResults.map((reflection) => (
                  <div key={reflection._id} className="result-card">
                    <div className="result-header">
                      <div className="result-date">{formatDate(reflection.createdAt)}</div>
                      {reflection.mood && <div className="result-mood">{reflection.mood}</div>}
                    </div>
                    <div className="result-content">
                      <p>{highlightText(reflection.content, searchQuery)}</p>
                    </div>
                    {reflection.tags && reflection.tags.length > 0 && (
                      <div className="result-tags">
                        {reflection.tags.map((tag, index) => (
                          <span key={index} className="tag">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <style jsx>{`
        .container {
          max-width: 800px;
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

        .search-form {
          margin-bottom: 40px;
        }

        .search-input-group {
          display: flex;
          gap: 10px;
          max-width: 600px;
          margin: 0 auto;
        }

        .search-input {
          flex: 1;
          padding: 15px 20px;
          border: 2px solid #e0e0e0;
          border-radius: 25px;
          font-size: 16px;
          transition: border-color 0.2s;
        }

        .search-input:focus {
          outline: none;
          border-color: #007bff;
        }

        .search-button {
          padding: 15px 30px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 25px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .search-button:hover:not(:disabled) {
          background: #0056b3;
        }

        .search-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .search-results h2 {
          color: #333;
          margin-bottom: 20px;
        }

        .results-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .result-card {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .result-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .result-date {
          color: #666;
          font-weight: 500;
        }

        .result-mood {
          font-size: 0.9rem;
          color: #666;
        }

        .result-content p {
          color: #333;
          line-height: 1.6;
          margin: 0;
        }

        .highlight {
          background: #fff3cd;
          padding: 2px 4px;
          border-radius: 3px;
          font-weight: 600;
        }

        .result-tags {
          margin-top: 15px;
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .tag {
          background: #f0f0f0;
          color: #666;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .navbar {
            flex-direction: column;
            gap: 15px;
          }

          .search-input-group {
            flex-direction: column;
          }

          .result-header {
            flex-direction: column;
            gap: 10px;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  )
}
