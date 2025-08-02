# Daily Reflection App - Installation Guide

## 🚨 Quick Fix for Dependency Issues

If you're getting dependency resolution errors, follow these steps:

### Option 1: Quick Start (Recommended)
\`\`\`bash
npm run quick-start
\`\`\`

### Option 2: Manual Installation
\`\`\`bash
# Clear npm cache
npm cache clean --force

# Install with legacy peer deps
npm install --legacy-peer-deps

# Verify MongoDB connection
npm run db:verify

# Setup database
npm run db:setup

# Start the app
npm run dev
\`\`\`

### Option 3: Clean Installation
\`\`\`bash
# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Run clean install script
npm run install:clean
\`\`\`

## 🔧 Troubleshooting

### Dependency Conflicts:
- Use `--legacy-peer-deps` flag
- React version downgraded to 18.3.1 for compatibility

### MongoDB Issues:
1. **Start MongoDB:**
   \`\`\`bash
   # Windows
   net start MongoDB
   
   # macOS
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   \`\`\`

2. **Verify Connection:**
   \`\`\`bash
   npm run db:verify
   \`\`\`

### Port Issues:
- App runs on: `http://localhost:3000`
- MongoDB on: `localhost:27017`

## ✅ Success Indicators

You'll know everything is working when:
- ✅ Dependencies install without errors
- ✅ MongoDB connection test passes
- ✅ Database setup completes
- ✅ App starts at localhost:3000
- ✅ You can see data in MongoDB Compass at localhost:27017

## 🆘 Still Having Issues?

Try this step-by-step approach:

1. **Delete everything:**
   \`\`\`bash
   rm -rf node_modules package-lock.json
   \`\`\`

2. **Clear npm cache:**
   \`\`\`bash
   npm cache clean --force
   \`\`\`

3. **Install with legacy flag:**
   \`\`\`bash
   npm install --legacy-peer-deps
   \`\`\`

4. **Test MongoDB:**
   \`\`\`bash
   npm run db:verify
   \`\`\`

5. **Setup database:**
   \`\`\`bash
   npm run db:setup
   \`\`\`

6. **Start app:**
   \`\`\`bash
   npm run dev
   \`\`\`

Your Daily Reflection app will be ready at `http://localhost:3000` with data stored in MongoDB at `localhost:27017`!
