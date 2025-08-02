const { execSync } = require("child_process")

console.log("🚀 Installing Daily Reflection App dependencies...")

try {
  // Clear npm cache first
  console.log("🧹 Clearing npm cache...")
  execSync("npm cache clean --force", { stdio: "inherit" })

  // Install dependencies with legacy peer deps to avoid conflicts
  console.log("📦 Installing dependencies...")
  execSync("npm install --legacy-peer-deps", { stdio: "inherit" })

  console.log("✅ Dependencies installed successfully!")
  console.log("\n🔧 Next steps:")
  console.log("1. npm run db:verify  - Test MongoDB connection")
  console.log("2. npm run db:setup   - Setup database")
  console.log("3. npm run dev        - Start the app")
} catch (error) {
  console.error("❌ Installation failed:", error.message)
  console.log("\n💡 Try running manually:")
  console.log("npm cache clean --force")
  console.log("npm install --legacy-peer-deps")
  process.exit(1)
}
