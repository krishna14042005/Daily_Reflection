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
      .sort({ createdAt: -1 })
      .toArray()

    const formattedReflections = reflections.map((reflection) => ({
      _id: reflection._id.toString(),
      content: reflection.content,
      date: reflection.date,
      createdAt: reflection.createdAt,
    }))

    return NextResponse.json(formattedReflections)
  } catch (error) {
    console.error("Get reflections error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userAuth = getUserFromRequest(request)
    if (!userAuth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { content, mood, tags } = await request.json()
    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const now = new Date()
    const today = now.toISOString().split("T")[0]

    const result = await db.collection("reflections").insertOne({
      userId: new ObjectId(userAuth.userId),
      content: content.trim(),
      mood: mood || null,
      tags: tags || [],
      date: today,
      createdAt: now,
    })

    const reflection = await db.collection("reflections").findOne({
      _id: result.insertedId,
    })

    return NextResponse.json(
      {
        _id: reflection!._id.toString(),
        content: reflection!.content,
        mood: reflection!.mood,
        tags: reflection!.tags,
        date: reflection!.date,
        createdAt: reflection!.createdAt,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Create reflection error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
