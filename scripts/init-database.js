const { MongoClient } = require("mongodb")

const MONGODB_URI = "mongodb://localhost:27017"
const MONGODB_DB = "daily_reflection"

async function initializeDatabase() {
  let client

  try {
    console.log("🔄 Connecting to MongoDB at localhost:27017...")

    client = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    })

    await client.connect()
    console.log("✅ Successfully connected to MongoDB")

    const db = client.db(MONGODB_DB)

    // Test the connection
    await db.admin().ping()
    console.log("✅ MongoDB ping successful")

    // Create collections if they don't exist
    const collections = await db.listCollections().toArray()
    const collectionNames = collections.map((col) => col.name)

    console.log("📋 Existing collections:", collectionNames)

    // Initialize users collection
    if (!collectionNames.includes("users")) {
      await db.createCollection("users")
      console.log("✅ Created 'users' collection")

      // Create unique index on email
      await db.collection("users").createIndex({ email: 1 }, { unique: true })
      console.log("✅ Created unique index on users.email")
    } else {
      console.log("ℹ️  'users' collection already exists")
    }

    // Initialize reflections collection
    if (!collectionNames.includes("reflections")) {
      await db.createCollection("reflections")
      console.log("✅ Created 'reflections' collection")

      // Create indexes for better performance
      await db.collection("reflections").createIndex({ userId: 1 })
      await db.collection("reflections").createIndex({ date: 1 })
      await db.collection("reflections").createIndex({ createdAt: -1 })
      console.log("✅ Created indexes on reflections collection")
    } else {
      console.log("ℹ️  'reflections' collection already exists")
    }

    // Insert sample data for testing (optional)
    const userCount = await db.collection("users").countDocuments()
    const reflectionCount = await db.collection("reflections").countDocuments()

    console.log(`📊 Database Statistics:`)
    console.log(`   - Users: ${userCount}`)
    console.log(`   - Reflections: ${reflectionCount}`)

    console.log("🎉 Database initialization completed successfully!")
    console.log("🔗 You can now view your data in MongoDB Compass at:")
    console.log(`   Connection String: ${MONGODB_URI}`)
    console.log(`   Database: ${MONGODB_DB}`)
  } catch (error) {
    console.error("❌ Database initialization error:", error.message)

    if (error.message.includes("ECONNREFUSED")) {
      console.log("\n💡 Troubleshooting:")
      console.log("   1. Make sure MongoDB is running on your system")
      console.log("   2. Check if MongoDB Compass is connected to localhost:27017")
      console.log("   3. Try starting MongoDB service:")
      console.log("      - Windows: net start MongoDB")
      console.log("      - macOS: brew services start mongodb-community")
      console.log("      - Linux: sudo systemctl start mongod")
    }

    process.exit(1)
  } finally {
    if (client) {
      await client.close()
      console.log("🔌 MongoDB connection closed")
    }
  }
}

// Run the initialization
initializeDatabase()
