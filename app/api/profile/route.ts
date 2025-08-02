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

    // Get user profile
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(userAuth.userId) }, { projection: { password: 0 } })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get reflection statistics
    const reflections = await db
      .collection("reflections")
      .find({ userId: new ObjectId(userAuth.userId) })
      .sort({ createdAt: 1 })
      .toArray()

    const totalReflections = reflections.length

    // Calculate streaks
    const dates = reflections.map((r) => r.date).sort()
    const uniqueDates = [...new Set(dates)]

    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 0

    const today = new Date()

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

    return NextResponse.json({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      bio: user.bio,
      profilePicture: user.profilePicture,
      createdAt: user.createdAt,
      totalReflections,
      currentStreak,
      longestStreak,
    })
  } catch (error) {
    console.error("Get profile error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userAuth = getUserFromRequest(request)
    if (!userAuth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, bio } = await request.json()

    const { db } = await connectToDatabase()

    const result = await db.collection("users").findOneAndUpdate(
      { _id: new ObjectId(userAuth.userId) },
      {
        $set: {
          name: name?.trim() || null,
          bio: bio?.trim() || null,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after", projection: { password: 0 } },
    )

    if (!result) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get updated statistics
    const reflections = await db
      .collection("reflections")
      .find({ userId: new ObjectId(userAuth.userId) })
      .toArray()

    const totalReflections = reflections.length

    // Calculate streaks (simplified for response)
    const dates = reflections.map((r) => r.date).sort()
    const uniqueDates = [...new Set(dates)]
    const currentStreak = uniqueDates.length > 0 ? 1 : 0 // Simplified
    const longestStreak = uniqueDates.length // Simplified

    return NextResponse.json({
      id: result._id.toString(),
      email: result.email,
      name: result.name,
      bio: result.bio,
      profilePicture: result.profilePicture,
      createdAt: result.createdAt,
      totalReflections,
      currentStreak,
      longestStreak,
    })
  } catch (error) {
    console.error("Update profile error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
