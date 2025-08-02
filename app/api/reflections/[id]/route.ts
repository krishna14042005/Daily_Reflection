import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getUserFromRequest } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userAuth = getUserFromRequest(request)
    if (!userAuth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { content } = await request.json()
    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const result = await db.collection("reflections").findOneAndUpdate(
      {
        _id: new ObjectId(params.id),
        userId: new ObjectId(userAuth.userId),
      },
      {
        $set: {
          content: content.trim(),
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" },
    )

    if (!result) {
      return NextResponse.json({ error: "Reflection not found" }, { status: 404 })
    }

    return NextResponse.json({
      _id: result._id.toString(),
      content: result.content,
      date: result.date,
      createdAt: result.createdAt,
    })
  } catch (error) {
    console.error("Update reflection error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userAuth = getUserFromRequest(request)
    if (!userAuth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    const result = await db.collection("reflections").deleteOne({
      _id: new ObjectId(params.id),
      userId: new ObjectId(userAuth.userId),
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Reflection not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Reflection deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Delete reflection error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
