import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getUserFromRequest } from "@/lib/auth"
import { ObjectId } from "mongodb"

const DEFAULT_PROMPTS = [
  { text: "What are you most grateful for today?", category: "gratitude", isDefault: true },
  { text: "What challenged you today and how did you overcome it?", category: "growth", isDefault: true },
  { text: "How did you show kindness to yourself or others today?", category: "kindness", isDefault: true },
  {
    text: "What emotions did you experience today? How did they guide your actions?",
    category: "emotions",
    isDefault: true,
  },
  { text: "What progress did you make toward your goals today?", category: "goals", isDefault: true },
  { text: "What did you learn about yourself today?", category: "self-discovery", isDefault: true },
  { text: "How did you take care of your physical and mental health today?", category: "wellness", isDefault: true },
  { text: "What moment today brought you the most joy?", category: "joy", isDefault: true },
  { text: "What would you do differently if you could relive today?", category: "reflection", isDefault: true },
  { text: "How did you connect with others today?", category: "relationships", isDefault: true },
]

export async function GET(request: NextRequest) {
  try {
    const userAuth = getUserFromRequest(request)
    if (!userAuth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { db } = await connectToDatabase()

    // Get user's custom prompts
    const customPrompts = await db
      .collection("prompts")
      .find({ userId: new ObjectId(userAuth.userId) })
      .sort({ createdAt: -1 })
      .toArray()

    const formattedCustomPrompts = customPrompts.map((prompt) => ({
      _id: prompt._id.toString(),
      text: prompt.text,
      category: prompt.category,
      isDefault: false,
      createdAt: prompt.createdAt,
    }))

    // Combine with default prompts
    const allPrompts = [
      ...DEFAULT_PROMPTS.map((prompt, index) => ({
        _id: `default_${index}`,
        ...prompt,
        createdAt: new Date().toISOString(),
      })),
      ...formattedCustomPrompts,
    ]

    return NextResponse.json(allPrompts)
  } catch (error) {
    console.error("Get prompts error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userAuth = getUserFromRequest(request)
    if (!userAuth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { text, category } = await request.json()
    if (!text || !text.trim()) {
      return NextResponse.json({ error: "Prompt text is required" }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const now = new Date()

    const result = await db.collection("prompts").insertOne({
      userId: new ObjectId(userAuth.userId),
      text: text.trim(),
      category: category || "reflection",
      createdAt: now,
    })

    const prompt = await db.collection("prompts").findOne({
      _id: result.insertedId,
    })

    return NextResponse.json(
      {
        _id: prompt!._id.toString(),
        text: prompt!.text,
        category: prompt!.category,
        isDefault: false,
        createdAt: prompt!.createdAt,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Create prompt error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
