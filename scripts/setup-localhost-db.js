const { MongoClient } = require("mongodb")

// Localhost configuration
const MONGODB_URI = "mongodb://localhost:27017"
const MONGODB_DB = "daily_reflection"

async function setupLocalhostDatabase() {
  let client

  try {
    console.log("🚀 Setting up Daily Reflection database on localhost...")
    console.log("📍 Target: localhost:27017")
    console.log("🗄️  Database: daily_reflection")

    client = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    })

    await client.connect()
    console.log("✅ Connected to localhost MongoDB")

    const db = client.db(MONGODB_DB)

    // Drop existing collections if they exist (fresh start)
    const collections = await db.listCollections().toArray()
    const collectionNames = collections.map((col) => col.name)

    if (collectionNames.includes("users")) {
      await db.collection("users").drop()
      console.log("🗑️  Dropped existing 'users' collection")
    }

    if (collectionNames.includes("reflections")) {
      await db.collection("reflections").drop()
      console.log("🗑️  Dropped existing 'reflections' collection")
    }

    // Create users collection
    await db.createCollection("users")
    console.log("✅ Created 'users' collection on localhost")

    // Create unique index on email
    await db.collection("users").createIndex({ email: 1 }, { unique: true })
    console.log("✅ Created unique index on users.email")

    // Create reflections collection
    await db.createCollection("reflections")
    console.log("✅ Created 'reflections' collection on localhost")

    // Create indexes for reflections
    await db.collection("reflections").createIndex({ userId: 1 })
    await db.collection("reflections").createIndex({ date: 1 })
    await db.collection("reflections").createIndex({ createdAt: -1 })
    await db.collection("reflections").createIndex({ userId: 1, date: 1 })
    console.log("✅ Created indexes on reflections collection")

    // Verify collections were created
    const newCollections = await db.listCollections().toArray()
    console.log("📋 Collections created on localhost:")
    for (const collection of newCollections) {
      console.log(`   - ${collection.name}`)
    }

    // Insert a test document to verify write operations
    console.log("🔄 Testing data insertion on localhost...")

    const testUser = {
      email: "test@localhost.com",
      password: "hashed_password_example",
      createdAt: new Date(),
      isTest: true,
    }

    const userResult = await db.collection("users").insertOne(testUser)
    console.log("✅ Test user inserted with ID:", userResult.insertedId)

    const testReflection = {
      userId: userResult.insertedId,
      content: "This is a test reflection stored on localhost MongoDB",
      date: new Date().toISOString().split("T")[0],
      createdAt: new Date(),
      isTest: true,
    }

    const reflectionResult = await db.collection("reflections").insertOne(testReflection)
    console.log("✅ Test reflection inserted with ID:", reflectionResult.insertedId)

    // Verify data can be read
    const userCount = await db.collection("users").countDocuments()
    const reflectionCount = await db.collection("reflections").countDocuments()

    console.log("📊 Database Statistics on localhost:")
    console.log(`   - Users: ${userCount}`)
    console.log(`   - Reflections: ${reflectionCount}`)

    // Clean up test data
    await db.collection("users").deleteOne({ isTest: true })
    await db.collection("reflections").deleteOne({ isTest: true })
    console.log("🧹 Cleaned up test data")

    console.log("\n🎉 Localhost database setup completed successfully!")
    console.log("🔗 Database Details:")
    console.log(`   - Host: localhost:27017`)
    console.log(`   - Database: ${MONGODB_DB}`)
    console.log(`   - Collections: users, reflections`)
    console.log("\n📊 To view your data:")
    console.log("   1. Open MongoDB Compass")
    console.log("   2. Connect to: mongodb://localhost:27017")
    console.log(`   3. Navigate to database: ${MONGODB_DB}`)
    console.log("   4. View collections: users, reflections")
  } catch (error) {
    console.error("❌ Localhost database setup failed:", error.message)
    process.exit(1)
  } finally {
    if (client) {
      await client.close()
      console.log("🔌 Localhost connection closed")
    }
  }
}

// Run the setup
setupLocalhostDatabase()
