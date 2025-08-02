"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface User {
  id: string
  email: string
}

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const [showReminder, setShowReminder] = useState(false)
  const [reminderMessage, setReminderMessage] = useState("")

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (user) {
      showDailyReminder()
    }
  }, [user])

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me")
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      }
    } catch (error) {
      console.error("Auth check failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const showDailyReminder = () => {
    const lastReminderDate = localStorage.getItem("lastReminderDate")
    const today = new Date().toDateString()

    if (lastReminderDate !== today) {
      const messages = [
        "🌅 Take a moment to reflect on your morning. What are you grateful for today?",
        "🌟 How did you grow today? What challenged you and how did you overcome it?",
        "💭 What emotions did you experience today? How did they guide your actions?",
        "🎯 What progress did you make toward your goals today?",
        "🌱 What did you learn about yourself today?",
        "💪 What strength did you discover in yourself today?",
        "🙏 What moment today are you most thankful for?",
      ]

      const randomMessage = messages[Math.floor(Math.random() * messages.length)]
      setReminderMessage(randomMessage)
      setShowReminder(true)
      localStorage.setItem("lastReminderDate", today)
    }
  }

  const closeReminder = () => {
    setShowReminder(false)
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      setUser(null)
      router.push("/login")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading your reflection space...</p>
      </div>
    )
  }

  return (
    <div className="page-container">
      <nav className="navbar">
        <div className="nav-brand">
          <h1 className="brand-title">Daily Reflection</h1>
        </div>
        {user ? (
          <div className="nav-links">
            <Link href="/reflections" className="nav-link">
              <span className="nav-icon"></span>
              My Reflections
            </Link>
            <Link href="/add-reflection" className="nav-link">
              <span className="nav-icon"></span>
              Add Reflection
            </Link>
            <Link href="/calendar" className="nav-link">
              <span className="nav-icon"></span>
              Calendar
            </Link>
            <Link href="/prompts" className="nav-link">
              <span className="nav-icon"></span>
              Prompts
            </Link>
            <Link href="/search" className="nav-link">
              <span className="nav-icon"></span>
              Search
            </Link>
            <Link href="/analytics" className="nav-link">
              <span className="nav-icon"></span>
              Analytics
            </Link>
            <Link href="/profile" className="nav-link">
              <span className="nav-icon"></span>
              Profile
            </Link>
            <button onClick={handleLogout} className="logout-btn">
              <span className="nav-icon"></span>
              Logout
            </button>
          </div>
        ) : (
          <div className="nav-links">
            <Link href="/login" className="nav-link">
              Login
            </Link>
            <Link href="/signup" className="nav-link nav-link-primary">
              Sign Up
            </Link>
          </div>
        )}
      </nav>

      <main className="main-content">
        {user ? (
          <div className="welcome-section animate-fade-in">
            <div className="welcome-header">
              <h2 className="welcome-title">Welcome back, {user.email.split("@")[0]}!</h2>
              <div className="welcome-decoration"></div>
            </div>

            <div className="action-buttons">
              <Link href="/add-reflection" className="btn btn-primary btn-large">
                <span className="btn-icon"></span>
                Add Today's Reflection
              </Link>
              <Link href="/reflections" className="btn btn-secondary btn-large">
                <span className="btn-icon"></span>
                View Past Reflections
              </Link>
            </div>
            <div className="quick-stats">
              <div className="stat-card">
                <div className="stat-icon"></div>
                <div className="stat-content">
                  <div className="stat-number">7</div>
                  <div className="stat-label">Day Streak</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon"></div>
                <div className="stat-content">
                  <div className="stat-number">42</div>
                  <div className="stat-label">Total Reflections</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon"></div>
                <div className="stat-content">
                  <div className="stat-number">1.2k</div>
                  <div className="stat-label">Words Written</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="hero-section animate-fade-in">
            <div className="hero-content">
              <h2 className="hero-title">
                Start Your
                <span className="text-gradient"> Daily Reflection </span>
                Journey
              </h2>
              <p className="hero-subtitle">
                Capture your thoughts, track your growth, and build a habit of mindful self-reflection. Transform your
                daily experiences into meaningful insights.
              </p>
              <div className="hero-features">
                <div className="feature-item">
                  <span className="feature-icon">🌱</span>
                  <span>Personal Growth</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">📊</span>
                  <span>Progress Tracking</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">🎯</span>
                  <span>Goal Achievement</span>
                </div>
              </div>
              <div className="action-buttons">
                <Link href="/signup" className="btn btn-primary btn-large">
                  <span className="btn-icon">🚀</span>
                  Get Started Free
                </Link>
                <Link href="/login" className="btn btn-secondary btn-large">
                  <span className="btn-icon">👋</span>
                  Welcome Back
                </Link>
              </div>
            </div>
            <div className="hero-visual">
              <div className="floating-card card-1">
                <div className="card-header">
                  <span className="card-date">Today</span>
                  <span className="card-mood">😊</span>
                </div>
                <p className="card-text">Today I learned something new about myself...</p>
              </div>
              <div className="floating-card card-2">
                <div className="card-header">
                  <span className="card-date">Yesterday</span>
                  <span className="card-mood">🤔</span>
                </div>
                <p className="card-text">Reflecting on my goals and progress...</p>
              </div>
              <div className="floating-card card-3">
                <div className="card-header">
                  <span className="card-date">This Week</span>
                  <span className="card-mood">🌟</span>
                </div>
                <p className="card-text">Grateful for the small moments...</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {showReminder && (
        <div className="reminder-overlay animate-fade-in">
          <div className="reminder-popup animate-scale-in">
            <div className="reminder-header">
              <div className="reminder-icon">🌟</div>
              <h3 className="reminder-title">Daily Reflection Reminder</h3>
              <button onClick={closeReminder} className="close-btn">
                <span>×</span>
              </button>
            </div>
            <div className="reminder-content">
              <p className="reminder-message">{reminderMessage}</p>
              <div className="reminder-actions">
                <Link href="/add-reflection" className="btn btn-primary" onClick={closeReminder}>
                  <span className="btn-icon">✨</span>
                  Start Reflecting
                </Link>
                <button onClick={closeReminder} className="btn btn-secondary">
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
          flex-wrap: wrap;
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
          position: relative;
          overflow: hidden;
        }

        .nav-link::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: var(--gradient-primary);
          opacity: 0.1;
          transition: left 0.3s ease;
          z-index: -1;
        }

        .nav-link:hover::before {
          left: 0;
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

        .logout-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: none;
          border: 1px solid var(--error-500);
          color: var(--error-500);
          border-radius: var(--radius-lg);
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .logout-btn:hover {
          background: var(--error-500);
          color: white;
          transform: translateY(-1px);
        }

        .main-content {
          padding: 4rem 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .welcome-section {
          text-align: center;
          max-width: 800px;
          margin: 0 auto;
        }

        .welcome-header {
          margin-bottom: 2rem;
          position: relative;
        }

        .welcome-title {
          font-family: var(--font-serif);
          font-size: 2.5rem;
          font-weight: 600;
          color: var(--neutral-800);
          margin-bottom: 1rem;
        }

        .welcome-decoration {
          width: 100px;
          height: 4px;
          background: var(--gradient-primary);
          margin: 0 auto;
          border-radius: 2px;
        }

        .daily-message {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 2rem;
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(10px);
          border-radius: var(--radius-2xl);
          border: 1px solid rgba(255, 255, 255, 0.2);
          margin-bottom: 3rem;
          box-shadow: var(--shadow-lg);
        }

        .message-icon {
          font-size: 2rem;
          flex-shrink: 0;
        }

        .message-text {
          font-size: 1.125rem;
          color: var(--neutral-700);
          margin: 0;
          text-align: left;
        }

        .action-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-bottom: 3rem;
          flex-wrap: wrap;
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
          position: relative;
          overflow: hidden;
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

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-xl);
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

        .quick-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          max-width: 600px;
          margin: 0 auto;
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(10px);
          border-radius: var(--radius-xl);
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-xl);
        }

        .stat-icon {
          font-size: 2rem;
          flex-shrink: 0;
        }

        .stat-content {
          text-align: left;
        }

        .stat-number {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--primary-600);
          line-height: 1;
        }

        .stat-label {
          font-size: 0.875rem;
          color: var(--neutral-600);
          font-weight: 500;
        }

        .hero-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
          min-height: 70vh;
        }

        .hero-content {
          text-align: left;
        }

        .hero-title {
          font-family: var(--font-serif);
          font-size: 3rem;
          font-weight: 700;
          color: var(--neutral-800);
          margin-bottom: 1.5rem;
          line-height: 1.2;
        }

        .hero-subtitle {
          font-size: 1.25rem;
          color: var(--neutral-600);
          margin-bottom: 2rem;
          line-height: 1.6;
        }

        .hero-features {
          display: flex;
          gap: 2rem;
          margin-bottom: 2.5rem;
          flex-wrap: wrap;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 500;
          color: var(--neutral-700);
        }

        .feature-icon {
          font-size: 1.25rem;
        }

        .hero-visual {
          position: relative;
          height: 500px;
        }

        .floating-card {
          position: absolute;
          width: 280px;
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(20px);
          border-radius: var(--radius-xl);
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: var(--shadow-xl);
          animation: float 6s ease-in-out infinite;
        }

        .card-1 {
          top: 50px;
          left: 50px;
          animation-delay: 0s;
        }

        .card-2 {
          top: 200px;
          right: 20px;
          animation-delay: 2s;
        }

        .card-3 {
          bottom: 80px;
          left: 20px;
          animation-delay: 4s;
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }

        .card-date {
          font-size: 0.875rem;
          color: var(--neutral-500);
          font-weight: 500;
        }

        .card-mood {
          font-size: 1.25rem;
        }

        .card-text {
          color: var(--neutral-700);
          font-size: 0.9rem;
          line-height: 1.5;
          margin: 0;
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

        .reminder-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(4px);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .reminder-popup {
          background: white;
          border-radius: var(--radius-2xl);
          max-width: 500px;
          width: 90%;
          box-shadow: var(--shadow-2xl);
          overflow: hidden;
        }

        .reminder-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 2rem;
          background: var(--gradient-primary);
          color: white;
        }

        .reminder-icon {
          font-size: 2rem;
        }

        .reminder-title {
          flex: 1;
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .close-btn {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s ease;
        }

        .close-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .reminder-content {
          padding: 2rem;
        }

        .reminder-message {
          font-size: 1.125rem;
          line-height: 1.6;
          color: var(--neutral-700);
          margin-bottom: 2rem;
          text-align: center;
        }

        .reminder-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }

        @media (max-width: 768px) {
          .navbar {
            flex-direction: column;
            gap: 1rem;
            padding: 1rem;
          }

          .nav-links {
            justify-content: center;
          }

          .main-content {
            padding: 2rem 1rem;
          }

          .hero-section {
            grid-template-columns: 1fr;
            gap: 2rem;
            text-align: center;
          }

          .hero-title {
            font-size: 2.5rem;
          }

          .hero-visual {
            height: 300px;
          }

          .floating-card {
            width: 220px;
            padding: 1rem;
          }

          .action-buttons {
            flex-direction: column;
            align-items: center;
          }

          .welcome-title {
            font-size: 2rem;
          }

          .quick-stats {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}
