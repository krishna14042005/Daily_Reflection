"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface UserProfile {
  id: string
  email: string
  name?: string
  bio?: string
  profilePicture?: string
  createdAt: string
  totalReflections: number
  currentStreak: number
  longestStreak: number
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    fetchProfile()
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

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/profile")
      if (response.ok) {
        const data = await response.json()
        setProfile(data)
        setFormData({
          name: data.name || "",
          bio: data.bio || "",
        })
      } else {
        setError("Failed to fetch profile")
      }
    } catch (error) {
      setError("An error occurred while fetching profile")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const updatedProfile = await response.json()
        setProfile(updatedProfile)
        setEditing(false)
        setSuccess("Profile updated successfully!")
      } else {
        const data = await response.json()
        setError(data.error || "Failed to update profile")
      }
    } catch (error) {
      setError("An error occurred while updating profile")
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (loading) {
    return <div className="loading">Loading profile...</div>
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
        <h1>My Profile</h1>

        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        {profile && (
          <div className="profile-container">
            <div className="profile-header">
              <div className="profile-avatar">
                <div className="avatar-placeholder">
                  {profile.name ? profile.name.charAt(0).toUpperCase() : profile.email.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="profile-info">
                <h2>{profile.name || "Anonymous User"}</h2>
                <p className="email">{profile.email}</p>
                <p className="join-date">Member since {formatDate(profile.createdAt)}</p>
              </div>
              <div className="profile-actions">
                {!editing && (
                  <button onClick={() => setEditing(true)} className="btn btn-primary">
                    Edit Profile
                  </button>
                )}
              </div>
            </div>

            <div className="profile-stats">
              <div className="stat-card">
                <div className="stat-number">{profile.totalReflections}</div>
                <div className="stat-label">Total Reflections</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{profile.currentStreak}</div>
                <div className="stat-label">Current Streak</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{profile.longestStreak}</div>
                <div className="stat-label">Longest Streak</div>
              </div>
            </div>

            {editing ? (
              <form onSubmit={handleSubmit} className="profile-form">
                <div className="form-group">
                  <label htmlFor="name">Display Name</label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your name"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="bio">Bio</label>
                  <textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell us about yourself..."
                    rows={4}
                  />
                </div>
                <div className="form-actions">
                  <button type="button" onClick={() => setEditing(false)} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="profile-details">
                <div className="detail-section">
                  <h3>About</h3>
                  <p>{profile.bio || "No bio added yet."}</p>
                </div>
              </div>
            )}
          </div>
        )}
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

        .success {
          color: #155724;
          margin-bottom: 20px;
          padding: 15px;
          background: #d4edda;
          border: 1px solid #c3e6cb;
          border-radius: 6px;
        }

        .profile-container {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .profile-header {
          display: flex;
          align-items: center;
          padding: 30px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .profile-avatar {
          margin-right: 20px;
        }

        .avatar-placeholder {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          font-weight: bold;
          color: white;
        }

        .profile-info {
          flex: 1;
        }

        .profile-info h2 {
          margin: 0 0 5px 0;
          font-size: 1.8rem;
        }

        .email {
          margin: 0 0 5px 0;
          opacity: 0.9;
        }

        .join-date {
          margin: 0;
          opacity: 0.8;
          font-size: 0.9rem;
        }

        .profile-actions {
          margin-left: 20px;
        }

        .profile-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 20px;
          padding: 30px;
          border-bottom: 1px solid #e0e0e0;
        }

        .stat-card {
          text-align: center;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .stat-number {
          font-size: 2rem;
          font-weight: bold;
          color: #007bff;
          margin-bottom: 5px;
        }

        .stat-label {
          color: #666;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .profile-form {
          padding: 30px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 5px;
          color: #555;
          font-weight: 500;
        }

        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 16px;
          font-family: inherit;
          transition: border-color 0.2s;
          box-sizing: border-box;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #007bff;
        }

        .form-group textarea {
          resize: vertical;
        }

        .form-actions {
          display: flex;
          gap: 15px;
          justify-content: flex-end;
        }

        .profile-details {
          padding: 30px;
        }

        .detail-section h3 {
          color: #333;
          margin-bottom: 10px;
        }

        .detail-section p {
          color: #666;
          line-height: 1.6;
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

          .profile-header {
            flex-direction: column;
            text-align: center;
            gap: 20px;
          }

          .profile-actions {
            margin-left: 0;
          }

          .form-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  )
}
