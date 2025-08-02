const { MongoClient } = require("mongodb")

const MONGODB_URI = "mongodb://localhost:27017"
const MONGODB_DB = "daily_reflection"

async function testConnection() {
  let client

  try {
    console.log("🔄 Testing MongoDB connection...")

    client = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    })

    await client.connect()
    console.log("✅ Connected to MongoDB successfully")

    const db = client.db(MONGODB_DB)

    // Test ping
    const pingResult = await db.admin().ping()
    console.log("✅ Ping successful:", pingResult)

    // List databases
    const adminDb = client.db().admin()
    const databases = await adminDb.listDatabases()
    console.log("📋 Available databases:")
    databases.databases.forEach((db) => {
      console.log(`   - ${db.name} (${(db.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`)
    })

    // Check collections in our database
    const collections = await db.listCollections().toArray()
    console.log(`📋 Collections in '${MONGODB_DB}':`)
    if (collections.length === 0) {
      console.log("   - No collections found (database will be created when first document is inserted)")
    } else {
      for (const collection of collections) {
        const count = await db.collection(collection.name).countDocuments()
        console.log(`   - ${collection.name}: ${count} documents`)
      }
    }

    // Test write operation
    console.log("🔄 Testing write operation...")
    const testCollection = db.collection("connection_test")
    const testDoc = {
      message: "Connection test successful",
      timestamp: new Date(),
      testId: Math.random().toString(36).substr(2, 9),
    }

    const insertResult = await testCollection.insertOne(testDoc)
    console.log("✅ Test document inserted with ID:", insertResult.insertedId)

    // Clean up test document
    await testCollection.deleteOne({ _id: insertResult.insertedId })
    console.log("✅ Test document cleaned up")

    console.log("\n🎉 MongoDB connection test completed successfully!")
    console.log("🔗 Your MongoDB is ready for the Daily Reflection app")
  } catch (error) {
    console.error("❌ Connection test failed:", error.message)

    if (error.message.includes("ECONNREFUSED")) {
      console.log("\n💡 MongoDB is not running. Please:")
      console.log("   1. Start MongoDB service on your system")
      console.log("   2. Open MongoDB Compass and connect to localhost:27017")
      console.log("   3. Run this test again")
    }

    process.exit(1)
  } finally {
    if (client) {
      await client.close()
      console.log("🔌 Connection closed")
    }
  }
}

// Run the test
testConnection()
