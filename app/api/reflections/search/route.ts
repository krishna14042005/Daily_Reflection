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
    const query = searchParams.get("q")

    if (!query) {
      return NextResponse.json({ error: "Search query is required" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Search in content and tags
    const searchResults = await db
      .collection("reflections")
      .find({
        userId: new ObjectId(userAuth.userId),
        $or: [
          { content: { $regex: query, $options: "i" } },
          { tags: { $in: [new RegExp(query, "i")] } },
          { mood: { $regex: query, $options: "i" } },
        ],
      })
      .sort({ createdAt: -1 })
      .toArray()

    const formattedResults = searchResults.map((reflection) => ({
      _id: reflection._id.toString(),
      content: reflection.content,
      date: reflection.date,
      createdAt: reflection.createdAt,
      mood: reflection.mood,
      tags: reflection.tags,
    }))

    return NextResponse.json(formattedResults)
  } catch (error) {
    console.error("Search error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
