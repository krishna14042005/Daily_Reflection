const { execSync } = require("child_process")

async function quickStart() {
  console.log("🚀 Daily Reflection App - Quick Start")
  console.log("=====================================\n")

  try {
    // Step 1: Install dependencies
    console.log("📦 Step 1: Installing dependencies...")
    execSync("npm install --legacy-peer-deps", { stdio: "inherit" })
    console.log("✅ Dependencies installed\n")

    // Step 2: Verify MongoDB
    console.log("🔍 Step 2: Verifying MongoDB connection...")
    execSync("node scripts/verify-localhost-connection.js", { stdio: "inherit" })
    console.log("✅ MongoDB connection verified\n")

    // Step 3: Setup database
    console.log("🗄️  Step 3: Setting up database...")
    execSync("node scripts/setup-localhost-db.js", { stdio: "inherit" })
    console.log("✅ Database setup complete\n")

    console.log("🎉 Setup completed successfully!")
    console.log("\n🚀 Starting the development server...")
    console.log("📍 App will be available at: http://localhost:3000")
    console.log("📊 MongoDB data at: localhost:27017/daily_reflection\n")

    // Step 4: Start the app
    execSync("npm run dev", { stdio: "inherit" })
  } catch (error) {
    console.error("❌ Quick start failed:", error.message)

    if (error.message.includes("ECONNREFUSED")) {
      console.log("\n💡 MongoDB is not running. Please start MongoDB first:")
      console.log("Windows: net start MongoDB")
      console.log("macOS: brew services start mongodb-community")
      console.log("Linux: sudo systemctl start mongod")
    }

    console.log("\n🔧 Manual setup:")
    console.log("1. npm install --legacy-peer-deps")
    console.log("2. npm run db:verify")
    console.log("3. npm run db:setup")
    console.log("4. npm run dev")

    process.exit(1)
  }
}

quickStart()
