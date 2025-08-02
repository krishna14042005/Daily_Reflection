"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface AnalyticsData {
  moodOverTime: { date: string; mood: string }[]
  wordFrequency: { word: string; count: number }[]
  reflectionsByMonth: { month: string; count: number }[]
  averageWordsPerDay: number
  totalWords: number
  mostActiveDay: string
  longestReflection: number
  moodDistribution: { mood: string; count: number }[]
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [timeRange, setTimeRange] = useState("30") // days
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    fetchAnalytics()
  }, [timeRange])

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

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/analytics?days=${timeRange}`)
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      } else {
        setError("Failed to fetch analytics")
      }
    } catch (error) {
      setError("An error occurred while fetching analytics")
    } finally {
      setLoading(false)
    }
  }

  const getMoodEmoji = (mood: string) => {
    const moodMap: { [key: string]: string } = {
      happy: "😊",
      calm: "😌",
      sad: "😔",
      anxious: "😰",
      frustrated: "😤",
      thoughtful: "🤔",
      tired: "😴",
      excited: "🎉",
    }
    const moodKey = mood.toLowerCase().split(" ")[1] || mood.toLowerCase()
    return moodMap[moodKey] || "😐"
  }

  const getWordCloudStyle = (word: string, count: number, maxCount: number) => {
    const size = Math.max(12, (count / maxCount) * 32)
    const opacity = Math.max(0.5, count / maxCount)
    return {
      fontSize: `${size}px`,
      opacity,
      color: `hsl(${Math.random() * 360}, 70%, 50%)`,
    }
  }

  if (loading) {
    return <div className="loading">Loading analytics...</div>
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
        <div className="page-header">
          <h1>Analytics Dashboard</h1>
          <div className="time-range-selector">
            <label htmlFor="timeRange">Time Range:</label>
            <select id="timeRange" value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
              <option value="all">All time</option>
            </select>
          </div>
        </div>

        {error && <div className="error">{error}</div>}

        {analytics && (
          <div className="analytics-grid">
            {/* Key Metrics */}
            <div className="metrics-section">
              <h2>Key Metrics</h2>
              <div className="metrics-grid">
                <div className="metric-card">
                  <div className="metric-number">{analytics.totalWords.toLocaleString()}</div>
                  <div className="metric-label">Total Words</div>
                </div>
                <div className="metric-card">
                  <div className="metric-number">{Math.round(analytics.averageWordsPerDay)}</div>
                  <div className="metric-label">Avg Words/Day</div>
                </div>
                <div className="metric-card">
                  <div className="metric-number">{analytics.longestReflection}</div>
                  <div className="metric-label">Longest Reflection</div>
                </div>
                <div className="metric-card">
                  <div className="metric-number">{analytics.mostActiveDay}</div>
                  <div className="metric-label">Most Active Day</div>
                </div>
              </div>
            </div>

            {/* Mood Distribution */}
            <div className="chart-section">
              <h2>Mood Distribution</h2>
              <div className="mood-chart">
                {analytics.moodDistribution.map((mood, index) => (
                  <div key={index} className="mood-bar">
                    <div className="mood-info">
                      <span className="mood-emoji">{getMoodEmoji(mood.mood)}</span>
                      <span className="mood-name">{mood.mood}</span>
                    </div>
                    <div className="bar-container">
                      <div
                        className="bar-fill"
                        style={{
                          width: `${(mood.count / Math.max(...analytics.moodDistribution.map((m) => m.count))) * 100}%`,
                        }}
                      ></div>
                      <span className="bar-count">{mood.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Word Cloud */}
            <div className="chart-section">
              <h2>Most Used Words</h2>
              <div className="word-cloud">
                {analytics.wordFrequency.slice(0, 50).map((word, index) => (
                  <span
                    key={index}
                    className="word-cloud-item"
                    style={getWordCloudStyle(word.word, word.count, analytics.wordFrequency[0]?.count || 1)}
                  >
                    {word.word}
                  </span>
                ))}
              </div>
            </div>

            {/* Mood Over Time */}
            <div className="chart-section">
              <h2>Mood Timeline</h2>
              <div className="mood-timeline">
                {analytics.moodOverTime.slice(-14).map((entry, index) => (
                  <div key={index} className="timeline-item">
                    <div className="timeline-date">
                      {new Date(entry.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                    <div className="timeline-mood">{getMoodEmoji(entry.mood)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly Activity */}
            <div className="chart-section">
              <h2>Monthly Activity</h2>
              <div className="activity-chart">
                {analytics.reflectionsByMonth.map((month, index) => (
                  <div key={index} className="activity-bar">
                    <div className="activity-month">{month.month}</div>
                    <div className="activity-bar-container">
                      <div
                        className="activity-bar-fill"
                        style={{
                          height: `${(month.count / Math.max(...analytics.reflectionsByMonth.map((m) => m.count))) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <div className="activity-count">{month.count}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      <style jsx>{`
        .container {
          max-width: 1200px;
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

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .page-header h1 {
          color: #333;
          margin: 0;
        }

        .time-range-selector {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .time-range-selector label {
          color: #666;
          font-weight: 500;
        }

        .time-range-selector select {
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }

        .error {
          color: #dc3545;
          margin-bottom: 20px;
          padding: 15px;
          background: #f8d7da;
          border: 1px solid #f5c6cb;
          border-radius: 6px;
        }

        .analytics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 30px;
        }

        .metrics-section,
        .chart-section {
          background: white;
          padding: 25px;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .metrics-section h2,
        .chart-section h2 {
          color: #333;
          margin-bottom: 20px;
          font-size: 1.3rem;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
        }

        .metric-card {
          text-align: center;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .metric-number {
          font-size: 2rem;
          font-weight: bold;
          color: #007bff;
          margin-bottom: 5px;
        }

        .metric-label {
          color: #666;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .mood-chart {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .mood-bar {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .mood-info {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 120px;
        }

        .mood-emoji {
          font-size: 18px;
        }

        .mood-name {
          font-size: 0.9rem;
          color: #666;
          text-transform: capitalize;
        }

        .bar-container {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 10px;
          background: #f0f0f0;
          border-radius: 10px;
          height: 20px;
          position: relative;
        }

        .bar-fill {
          background: linear-gradient(90deg, #007bff, #0056b3);
          height: 100%;
          border-radius: 10px;
          transition: width 0.3s ease;
        }

        .bar-count {
          position: absolute;
          right: 8px;
          font-size: 0.8rem;
          color: #666;
          font-weight: 500;
        }

        .word-cloud {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          justify-content: center;
          align-items: center;
          min-height: 200px;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .word-cloud-item {
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s;
          padding: 2px 4px;
          border-radius: 4px;
        }

        .word-cloud-item:hover {
          transform: scale(1.1);
          background: rgba(255, 255, 255, 0.8);
        }

        .mood-timeline {
          display: flex;
          gap: 10px;
          overflow-x: auto;
          padding: 10px 0;
        }

        .timeline-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          min-width: 60px;
        }

        .timeline-date {
          font-size: 0.8rem;
          color: #666;
          text-align: center;
        }

        .timeline-mood {
          font-size: 24px;
          padding: 8px;
          background: #f8f9fa;
          border-radius: 50%;
        }

        .activity-chart {
          display: flex;
          align-items: end;
          gap: 8px;
          height: 200px;
          padding: 20px 0;
        }

        .activity-bar {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
          height: 100%;
        }

        .activity-month {
          font-size: 0.8rem;
          color: #666;
          margin-bottom: 10px;
          transform: rotate(-45deg);
          white-space: nowrap;
        }

        .activity-bar-container {
          flex: 1;
          width: 20px;
          background: #f0f0f0;
          border-radius: 4px;
          display: flex;
          align-items: end;
          margin-bottom: 5px;
        }

        .activity-bar-fill {
          width: 100%;
          background: linear-gradient(180deg, #007bff, #0056b3);
          border-radius: 4px;
          transition: height 0.3s ease;
          min-height: 2px;
        }

        .activity-count {
          font-size: 0.8rem;
          color: #666;
          font-weight: 500;
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

          .page-header {
            flex-direction: column;
            gap: 15px;
            align-items: flex-start;
          }

          .analytics-grid {
            grid-template-columns: 1fr;
          }

          .metrics-grid {
            grid-template-columns: 1fr;
          }

          .mood-timeline {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  )
}
