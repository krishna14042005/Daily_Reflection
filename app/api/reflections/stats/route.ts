import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getUserFromRequest } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const userAuth = getUserFromRequest(request)
    if (!userAuth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    const reflections = await db
      .collection("reflections")
      .find({ userId: new ObjectId(userAuth.userId) })
      .sort({ createdAt: 1 })
      .toArray()

    // Calculate statistics
    const totalReflections = reflections.length
    const totalWords = reflections.reduce((sum, reflection) => {
      const wordCount = reflection.content
        .trim()
        .split(/\s+/)
        .filter((word: string) => word.length > 0).length
      return sum + wordCount
    }, 0)

    const averageWordsPerReflection = totalReflections > 0 ? totalWords / totalReflections : 0

    // Calculate streaks
    const dates = reflections.map((r) => r.date).sort()
    const uniqueDates = [...new Set(dates)]

    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 0

    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    // Calculate current streak
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today)
      checkDate.setDate(checkDate.getDate() - i)
      const dateString = checkDate.toISOString().split("T")[0]

      if (uniqueDates.includes(dateString)) {
        currentStreak++
      } else {
        break
      }
    }

    // Calculate longest streak
    for (let i = 0; i < uniqueDates.length; i++) {
      if (i === 0) {
        tempStreak = 1
      } else {
        const prevDate = new Date(uniqueDates[i - 1])
        const currDate = new Date(uniqueDates[i])
        const diffTime = currDate.getTime() - prevDate.getTime()
        const diffDays = diffTime / (1000 * 60 * 60 * 24)

        if (diffDays === 1) {
          tempStreak++
        } else {
          longestStreak = Math.max(longestStreak, tempStreak)
          tempStreak = 1
        }
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak)

    // Recent activity
    const recentActivity = reflections
      .slice(-5)
      .reverse()
      .map((reflection) => {
        const date = new Date(reflection.createdAt).toLocaleDateString()
        const wordCount = reflection.content
          .trim()
          .split(/\s+/)
          .filter((word: string) => word.length > 0).length
        return `${date}: Wrote ${wordCount} words`
      })

    const stats = {
      totalReflections,
      totalWords,
      averageWordsPerReflection,
      currentStreak,
      longestStreak,
      recentActivity,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Get stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
