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

    const { searchParams } = new URL(request.url)
    const days = searchParams.get("days") || "30"

    const { db } = await connectToDatabase()

    // Calculate date range
    let dateFilter = {}
    if (days !== "all") {
      const daysAgo = new Date()
      daysAgo.setDate(daysAgo.getDate() - Number.parseInt(days))
      dateFilter = { createdAt: { $gte: daysAgo } }
    }

    // Get reflections within date range
    const reflections = await db
      .collection("reflections")
      .find({
        userId: new ObjectId(userAuth.userId),
        ...dateFilter,
      })
      .sort({ createdAt: 1 })
      .toArray()

    // Calculate analytics
    const totalWords = reflections.reduce((sum, reflection) => {
      const wordCount = reflection.content
        .trim()
        .split(/\s+/)
        .filter((word: string) => word.length > 0).length
      return sum + wordCount
    }, 0)

    const averageWordsPerDay = reflections.length > 0 ? totalWords / reflections.length : 0

    // Find longest reflection
    const longestReflection = Math.max(
      ...reflections.map(
        (r) =>
          r.content
            .trim()
            .split(/\s+/)
            .filter((word: string) => word.length > 0).length,
      ),
      0,
    )

    // Most active day of week
    const dayCount: { [key: string]: number } = {}
    reflections.forEach((reflection) => {
      const day = new Date(reflection.createdAt).toLocaleDateString("en-US", { weekday: "long" })
      dayCount[day] = (dayCount[day] || 0) + 1
    })
    const mostActiveDay = Object.keys(dayCount).reduce((a, b) => (dayCount[a] > dayCount[b] ? a : b), "None")

    // Mood over time
    const moodOverTime = reflections
      .filter((r) => r.mood)
      .map((r) => ({
        date: r.date,
        mood: r.mood,
      }))

    // Mood distribution
    const moodCount: { [key: string]: number } = {}
    reflections.forEach((reflection) => {
      if (reflection.mood) {
        moodCount[reflection.mood] = (moodCount[reflection.mood] || 0) + 1
      }
    })
    const moodDistribution = Object.entries(moodCount).map(([mood, count]) => ({
      mood,
      count,
    }))

    // Word frequency analysis
    const wordCount: { [key: string]: number } = {}
    const stopWords = new Set([
      "the",
      "a",
      "an",
      "and",
      "or",
      "but",
      "in",
      "on",
      "at",
      "to",
      "for",
      "of",
      "with",
      "by",
      "i",
      "me",
      "my",
      "myself",
      "we",
      "our",
      "ours",
      "ourselves",
      "you",
      "your",
      "yours",
      "yourself",
      "yourselves",
      "he",
      "him",
      "his",
      "himself",
      "she",
      "her",
      "hers",
      "herself",
      "it",
      "its",
      "itself",
      "they",
      "them",
      "their",
      "theirs",
      "themselves",
      "what",
      "which",
      "who",
      "whom",
      "this",
      "that",
      "these",
      "those",
      "am",
      "is",
      "are",
      "was",
      "were",
      "be",
      "been",
      "being",
      "have",
      "has",
      "had",
      "having",
      "do",
      "does",
      "did",
      "doing",
      "will",
      "would",
      "should",
      "could",
      "can",
      "may",
      "might",
      "must",
      "shall",
    ])

    reflections.forEach((reflection) => {
      const words = reflection.content
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .split(/\s+/)
        .filter((word: string) => word.length > 2 && !stopWords.has(word))

      words.forEach((word: string) => {
        wordCount[word] = (wordCount[word] || 0) + 1
      })
    })

    const wordFrequency = Object.entries(wordCount)
      .map(([word, count]) => ({ word, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 100)

    // Reflections by month
    const monthCount: { [key: string]: number } = {}
    reflections.forEach((reflection) => {
      const month = new Date(reflection.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
      })
      monthCount[month] = (monthCount[month] || 0) + 1
    })
    const reflectionsByMonth = Object.entries(monthCount).map(([month, count]) => ({
      month,
      count,
    }))

    const analytics = {
      moodOverTime,
      wordFrequency,
      reflectionsByMonth,
      averageWordsPerDay,
      totalWords,
      mostActiveDay,
      longestReflection,
      moodDistribution,
    }

    return NextResponse.json(analytics)
  } catch (error) {
    console.error("Get analytics error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
