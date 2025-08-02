import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getUserFromRequest } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userAuth = getUserFromRequest(request)
    if (!userAuth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Don't allow deletion of default prompts
    if (params.id.startsWith("default_")) {
      return NextResponse.json({ error: "Cannot delete default prompts" }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const result = await db.collection("prompts").deleteOne({
      _id: new ObjectId(params.id),
      userId: new ObjectId(userAuth.userId),
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Prompt not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Prompt deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Delete prompt error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
