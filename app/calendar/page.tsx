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

interface CalendarDay {
  date: string
  isCurrentMonth: boolean
  isToday: boolean
  hasReflection: boolean
  reflection?: Reflection
}

export default function CalendarPage() {
  const [reflections, setReflections] = useState<Reflection[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedReflection, setSelectedReflection] = useState<Reflection | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()

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

  const generateCalendarDays = (): CalendarDay[] => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    const firstDayOfMonth = new Date(year, month, 1)
    const lastDayOfMonth = new Date(year, month + 1, 0)
    const firstDayOfWeek = firstDayOfMonth.getDay()

    const days: CalendarDay[] = []
    const today = new Date()
    const todayString = today.toISOString().split("T")[0]

    // Add days from previous month
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(firstDayOfMonth)
      date.setDate(date.getDate() - (i + 1))
      const dateString = date.toISOString().split("T")[0]
      const reflection = reflections.find((r) => r.date === dateString)

      days.push({
        date: dateString,
        isCurrentMonth: false,
        isToday: dateString === todayString,
        hasReflection: !!reflection,
        reflection,
      })
    }

    // Add days from current month
    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
      const date = new Date(year, month, day)
      const dateString = date.toISOString().split("T")[0]
      const reflection = reflections.find((r) => r.date === dateString)

      days.push({
        date: dateString,
        isCurrentMonth: true,
        isToday: dateString === todayString,
        hasReflection: !!reflection,
        reflection,
      })
    }

    // Add days from next month to complete the grid
    const remainingDays = 42 - days.length
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day)
      const dateString = date.toISOString().split("T")[0]
      const reflection = reflections.find((r) => r.date === dateString)

      days.push({
        date: dateString,
        isCurrentMonth: false,
        isToday: dateString === todayString,
        hasReflection: !!reflection,
        reflection,
      })
    }

    return days
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(newDate.getMonth() - 1)
      } else {
        newDate.setMonth(newDate.getMonth() + 1)
      }
      return newDate
    })
  }

  const handleDayClick = (day: CalendarDay) => {
    if (day.hasReflection && day.reflection) {
      setSelectedReflection(day.reflection)
    }
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

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  if (loading) {
    return <div className="loading">Loading calendar...</div>
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
          <Link href="/profile">Profile</Link>
          <Link href="/stats">Statistics</Link>
        </div>
      </nav>

      <main className="main-content">
        <div className="calendar-header">
          <h1>Reflection Calendar</h1>
          <div className="calendar-navigation">
            <button onClick={() => navigateMonth("prev")} className="nav-btn">
              ←
            </button>
            <h2>
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button onClick={() => navigateMonth("next")} className="nav-btn">
              →
            </button>
          </div>
        </div>

        {error && <div className="error">{error}</div>}

        <div className="calendar-container">
          <div className="calendar-grid">
            <div className="calendar-header-row">
              {dayNames.map((day) => (
                <div key={day} className="day-header">
                  {day}
                </div>
              ))}
            </div>

            <div className="calendar-body">
              {generateCalendarDays().map((day, index) => (
                <div
                  key={index}
                  className={`calendar-day ${!day.isCurrentMonth ? "other-month" : ""} ${
                    day.isToday ? "today" : ""
                  } ${day.hasReflection ? "has-reflection" : ""}`}
                  onClick={() => handleDayClick(day)}
                >
                  <div className="day-number">{new Date(day.date).getDate()}</div>
                  {day.hasReflection && (
                    <div className="reflection-indicator">
                      {day.reflection?.mood && <span className="mood-emoji">{day.reflection.mood.split(" ")[0]}</span>}
                      <div className="reflection-dot"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {selectedReflection && (
            <div className="reflection-preview">
              <div className="preview-header">
                <h3>Reflection for {formatDate(selectedReflection.date)}</h3>
                <button onClick={() => setSelectedReflection(null)} className="close-btn">
                  ×
                </button>
              </div>
              <div className="preview-content">
                {selectedReflection.mood && <div className="reflection-mood">{selectedReflection.mood}</div>}
                <p>{selectedReflection.content}</p>
                {selectedReflection.tags && selectedReflection.tags.length > 0 && (
                  <div className="reflection-tags">
                    {selectedReflection.tags.map((tag, index) => (
                      <span key={index} className="tag">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="reflection-meta">
                  <span>{getWordCount(selectedReflection.content)} words</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="calendar-legend">
          <div className="legend-item">
            <div className="legend-dot has-reflection"></div>
            <span>Has reflection</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot today"></div>
            <span>Today</span>
          </div>
        </div>
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

        .calendar-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .calendar-header h1 {
          color: #333;
          margin-bottom: 20px;
        }

        .calendar-navigation {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
        }

        .nav-btn {
          background: #007bff;
          color: white;
          border: none;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }

        .nav-btn:hover {
          background: #0056b3;
        }

        .calendar-navigation h2 {
          color: #333;
          margin: 0;
          min-width: 200px;
        }

        .error {
          color: #dc3545;
          margin-bottom: 20px;
          padding: 15px;
          background: #f8d7da;
          border: 1px solid #f5c6cb;
          border-radius: 6px;
          text-align: center;
        }

        .calendar-container {
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 30px;
          margin-bottom: 30px;
        }

        .calendar-grid {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .calendar-header-row {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          background: #f8f9fa;
        }

        .day-header {
          padding: 15px;
          text-align: center;
          font-weight: 600;
          color: #666;
          border-right: 1px solid #e0e0e0;
        }

        .day-header:last-child {
          border-right: none;
        }

        .calendar-body {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
        }

        .calendar-day {
          aspect-ratio: 1;
          border-right: 1px solid #e0e0e0;
          border-bottom: 1px solid #e0e0e0;
          padding: 10px;
          cursor: pointer;
          transition: background 0.2s;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .calendar-day:nth-child(7n) {
          border-right: none;
        }

        .calendar-day:hover {
          background: #f8f9fa;
        }

        .calendar-day.other-month {
          color: #ccc;
          background: #fafafa;
        }

        .calendar-day.today {
          background: #e3f2fd;
          color: #1976d2;
          font-weight: bold;
        }

        .calendar-day.has-reflection {
          background: #e8f5e8;
          cursor: pointer;
        }

        .calendar-day.has-reflection:hover {
          background: #d4edda;
        }

        .day-number {
          font-weight: 500;
        }

        .reflection-indicator {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 5px;
        }

        .mood-emoji {
          font-size: 16px;
        }

        .reflection-dot {
          width: 8px;
          height: 8px;
          background: #28a745;
          border-radius: 50%;
        }

        .reflection-preview {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          height: fit-content;
          max-height: 500px;
          overflow-y: auto;
        }

        .preview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #e0e0e0;
          background: #f8f9fa;
          border-radius: 12px 12px 0 0;
        }

        .preview-header h3 {
          margin: 0;
          color: #333;
          font-size: 1.1rem;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #666;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: background 0.2s;
        }

        .close-btn:hover {
          background: #e0e0e0;
        }

        .preview-content {
          padding: 20px;
        }

        .reflection-mood {
          font-size: 1.1rem;
          margin-bottom: 15px;
          color: #666;
        }

        .preview-content p {
          color: #333;
          line-height: 1.6;
          margin-bottom: 15px;
        }

        .reflection-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 15px;
        }

        .tag {
          background: #f0f0f0;
          color: #666;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .reflection-meta {
          color: #666;
          font-size: 0.9rem;
          text-align: right;
        }

        .calendar-legend {
          display: flex;
          justify-content: center;
          gap: 30px;
          padding: 20px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .legend-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }

        .legend-dot.has-reflection {
          background: #28a745;
        }

        .legend-dot.today {
          background: #1976d2;
        }

        .loading {
          text-align: center;
          padding: 60px 0;
          color: #666;
          font-size: 1.2rem;
        }

        @media (max-width: 1024px) {
          .calendar-container {
            grid-template-columns: 1fr;
          }

          .reflection-preview {
            max-height: 300px;
          }
        }

        @media (max-width: 768px) {
          .navbar {
            flex-direction: column;
            gap: 15px;
          }

          .calendar-navigation {
            flex-direction: column;
            gap: 15px;
          }

          .calendar-day {
            padding: 5px;
            font-size: 0.9rem;
          }

          .calendar-legend {
            flex-direction: column;
            gap: 15px;
          }
        }
      `}</style>
    </div>
  )
}
