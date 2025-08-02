"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface Reflection {
  _id: string
  content: string
  date: string
  createdAt: string
}

interface Stats {
  totalReflections: number
  totalWords: number
  averageWordsPerReflection: number
  longestStreak: number
  currentStreak: number
  reflectionsByMonth: { [key: string]: number }
  recentActivity: string[]
}

export default function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    fetchStats()
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

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/reflections/stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else {
        setError("Failed to fetch statistics")
      }
    } catch (error) {
      setError("An error occurred while fetching statistics")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading statistics...</div>
  }

  if (error) {
    return <div className="error">{error}</div>
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
        </div>
      </nav>

      <main className="main-content">
        <h1>Your Reflection Statistics</h1>

        {stats && (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">{stats.totalReflections}</div>
              <div className="stat-label">Total Reflections</div>
            </div>

            <div className="stat-card">
              <div className="stat-number">{stats.totalWords.toLocaleString()}</div>
              <div className="stat-label">Total Words Written</div>
            </div>

            <div className="stat-card">
              <div className="stat-number">{Math.round(stats.averageWordsPerReflection)}</div>
              <div className="stat-label">Average Words per Reflection</div>
            </div>

            <div className="stat-card">
              <div className="stat-number">{stats.currentStreak}</div>
              <div className="stat-label">Current Streak (days)</div>
            </div>

            <div className="stat-card">
              <div className="stat-number">{stats.longestStreak}</div>
              <div className="stat-label">Longest Streak (days)</div>
            </div>
          </div>
        )}

        <div className="activity-section">
          <h2>Recent Activity</h2>
          {stats?.recentActivity && stats.recentActivity.length > 0 ? (
            <div className="activity-list">
              {stats.recentActivity.map((activity, index) => (
                <div key={index} className="activity-item">
                  {activity}
                </div>
              ))}
            </div>
          ) : (
            <p>No recent activity</p>
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

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }

        .stat-card {
          background: white;
          padding: 30px 20px;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          text-align: center;
          border: 1px solid #e0e0e0;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 15px rgba(0, 0, 0, 0.15);
        }

        .stat-number {
          font-size: 2.5rem;
          font-weight: bold;
          color: #007bff;
          margin-bottom: 10px;
        }

        .stat-label {
          color: #666;
          font-weight: 500;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .activity-section {
          background: white;
          padding: 30px;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          border: 1px solid #e0e0e0;
        }

        .activity-section h2 {
          color: #333;
          margin-bottom: 20px;
          font-size: 1.5rem;
        }

        .activity-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .activity-item {
          padding: 12px 16px;
          background: #f8f9fa;
          border-radius: 6px;
          color: #555;
          border-left: 4px solid #007bff;
        }

        .loading {
          text-align: center;
          padding: 60px 0;
          color: #666;
          font-size: 1.2rem;
        }

        .error {
          color: #dc3545;
          text-align: center;
          padding: 60px 0;
          font-size: 1.2rem;
        }

        @media (max-width: 768px) {
          .navbar {
            flex-direction: column;
            gap: 15px;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .stat-number {
            font-size: 2rem;
          }
        }
      `}</style>
    </div>
  )
}
