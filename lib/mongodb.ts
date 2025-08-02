import { MongoClient, type Db } from "mongodb"

// Hardcoded localhost connection - no environment variables needed
const MONGODB_URI = "mongodb://localhost:27017"
const MONGODB_DB = "daily_reflection"

let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }

  try {
    console.log("🔄 Connecting to MongoDB at localhost:27017...")

    const client = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      maxPoolSize: 10,
      minPoolSize: 5,
    })

    await client.connect()
    console.log("✅ Successfully connected to MongoDB localhost")

    const db = client.db(MONGODB_DB)

    // Test the connection with a ping
    await db.admin().ping()
    console.log("✅ MongoDB localhost ping successful")

    cachedClient = client
    cachedDb = db

    return { client, db }
  } catch (error) {
    console.error("❌ MongoDB localhost connection error:", error)
    console.log("💡 Make sure MongoDB is running on localhost:27017")
    throw new Error(`Failed to connect to MongoDB localhost: ${error}`)
  }
}

export async function initializeDatabase() {
  try {
    const { db } = await connectToDatabase()
    console.log("🔄 Initializing database on localhost...")

    // Create collections if they don't exist
    const collections = await db.listCollections().toArray()
    const collectionNames = collections.map((col) => col.name)

    if (!collectionNames.includes("users")) {
      await db.createCollection("users")
      console.log("✅ Created 'users' collection on localhost")

      // Create unique index on email
      await db.collection("users").createIndex({ email: 1 }, { unique: true })
      console.log("✅ Created unique index on users.email")
    }

    if (!collectionNames.includes("reflections")) {
      await db.createCollection("reflections")
      console.log("✅ Created 'reflections' collection on localhost")

      // Create indexes for better performance
      await db.collection("reflections").createIndex({ userId: 1 })
      await db.collection("reflections").createIndex({ date: 1 })
      await db.collection("reflections").createIndex({ createdAt: -1 })
      console.log("✅ Created indexes on reflections collection")
    }

    console.log("🎉 Database initialization completed on localhost:27017")
    console.log("📊 Database: daily_reflection")
    console.log("📋 Collections: users, reflections")

    return true
  } catch (error) {
    console.error("❌ Database initialization error:", error)
    throw error
  }
}
