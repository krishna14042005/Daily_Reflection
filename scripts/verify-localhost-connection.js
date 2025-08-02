const { MongoClient } = require("mongodb")

// Direct localhost connection
const MONGODB_URI = "mongodb://localhost:27017"
const MONGODB_DB = "daily_reflection"

async function verifyLocalhostConnection() {
  let client

  try {
    console.log("🔍 Verifying localhost MongoDB connection...")
    console.log("📍 Connection URI:", MONGODB_URI)
    console.log("🗄️  Database:", MONGODB_DB)

    client = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    })

    console.log("🔄 Attempting to connect...")
    await client.connect()
    console.log("✅ Connected to MongoDB on localhost:27017")

    const db = client.db(MONGODB_DB)

    // Test ping
    const pingResult = await db.admin().ping()
    console.log("✅ Ping successful:", pingResult)

    // Check server info
    const serverInfo = await db.admin().serverStatus()
    console.log("🖥️  MongoDB Server Info:")
    console.log(`   - Version: ${serverInfo.version}`)
    console.log(`   - Host: ${serverInfo.host}`)
    console.log(`   - Process: ${serverInfo.process}`)

    // List all databases
    const adminDb = client.db().admin()
    const databases = await adminDb.listDatabases()
    console.log("📋 Available databases on localhost:")
    databases.databases.forEach((db) => {
      console.log(`   - ${db.name}`)
    })

    // Check our specific database
    const collections = await db.listCollections().toArray()
    console.log(`📂 Collections in '${MONGODB_DB}':`)

    if (collections.length === 0) {
      console.log("   - No collections found (will be created when app runs)")
    } else {
      for (const collection of collections) {
        const count = await db.collection(collection.name).countDocuments()
        console.log(`   - ${collection.name}: ${count} documents`)
      }
    }

    // Test write operation to localhost
    console.log("🔄 Testing write operation to localhost...")
    const testCollection = db.collection("localhost_test")
    const testDoc = {
      message: "Localhost connection verified",
      timestamp: new Date(),
      host: "localhost:27017",
      database: MONGODB_DB,
    }

    const insertResult = await testCollection.insertOne(testDoc)
    console.log("✅ Test document written to localhost with ID:", insertResult.insertedId)

    // Read back the test document
    const readDoc = await testCollection.findOne({ _id: insertResult.insertedId })
    console.log("✅ Test document read from localhost:", readDoc.message)

    // Clean up test document
    await testCollection.deleteOne({ _id: insertResult.insertedId })
    console.log("✅ Test document cleaned up from localhost")

    console.log("\n🎉 Localhost MongoDB verification completed successfully!")
    console.log("🔗 Your data will be stored at:")
    console.log(`   - Host: localhost:27017`)
    console.log(`   - Database: ${MONGODB_DB}`)
    console.log("📊 Open MongoDB Compass and connect to localhost:27017 to view data")
  } catch (error) {
    console.error("❌ Localhost connection verification failed:", error.message)

    if (error.message.includes("ECONNREFUSED")) {
      console.log("\n💡 MongoDB is not running on localhost. Please:")
      console.log("   1. Start MongoDB service:")
      console.log("      - Windows: net start MongoDB")
      console.log("      - macOS: brew services start mongodb-community")
      console.log("      - Linux: sudo systemctl start mongod")
      console.log("   2. Verify MongoDB is listening on port 27017")
      console.log("   3. Open MongoDB Compass and connect to localhost:27017")
    }

    process.exit(1)
  } finally {
    if (client) {
      await client.close()
      console.log("🔌 Localhost connection closed")
    }
  }
}

// Run the verification
verifyLocalhostConnection()
