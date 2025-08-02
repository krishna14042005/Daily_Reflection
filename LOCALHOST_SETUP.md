# Daily Reflection App - Localhost Setup

## 🎯 Localhost MongoDB Configuration

This app is configured to store ALL data directly on your local MongoDB instance at `localhost:27017`.

### 📍 Connection Details:
- **Host**: localhost:27017
- **Database**: daily_reflection
- **Collections**: users, reflections
- **No environment variables needed** - everything is hardcoded for localhost

## 🚀 Quick Setup

### 1. Start MongoDB on Localhost
\`\`\`bash
# Windows
net start MongoDB

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
\`\`\`

### 2. Verify Localhost Connection
\`\`\`bash
npm run db:verify
\`\`\`

### 3. Setup Database on Localhost
\`\`\`bash
npm run db:setup
\`\`\`

### 4. Start the App
\`\`\`bash
npm run dev
\`\`\`

## 📊 Viewing Your Data

### MongoDB Compass:
1. Open MongoDB Compass
2. Connect to: `mongodb://localhost:27017`
3. Navigate to database: `daily_reflection`
4. View collections:
   - `users` - User accounts and authentication
   - `reflections` - Daily reflection entries

### Command Line:
\`\`\`bash
# Connect to MongoDB shell
mongosh mongodb://localhost:27017/daily_reflection

# View users
db.users.find()

# View reflections
db.reflections.find()
\`\`\`

## 🔧 Localhost Commands

\`\`\`bash
# Verify localhost connection
npm run db:verify

# Setup fresh database on localhost
npm run db:setup

# One-command setup and start
npm run localhost:setup
\`\`\`

## 📁 Data Storage Location

All your reflection data is stored locally at:
- **MongoDB Data Directory**: Usually `/data/db` (Linux/Mac) or `C:\data\db` (Windows)
- **Database**: `daily_reflection`
- **Accessible via**: MongoDB Compass at localhost:27017

## 🔍 Troubleshooting

### MongoDB Not Running:
\`\`\`bash
# Check if MongoDB is running
ps aux | grep mongod  # Linux/Mac
tasklist | findstr mongod  # Windows

# Start MongoDB service
sudo systemctl start mongod  # Linux
brew services start mongodb-community  # Mac
net start MongoDB  # Windows
\`\`\`

### Connection Issues:
1. Ensure MongoDB is listening on port 27017
2. Check firewall settings
3. Verify MongoDB Compass can connect to localhost:27017
4. Run `npm run db:verify` to test connection

## ✅ What Gets Stored Locally

### Users Collection:
\`\`\`json
{
  "_id": ObjectId("..."),
  "email": "user@example.com",
  "password": "hashed_password",
  "createdAt": ISODate("...")
}
\`\`\`

### Reflections Collection:
\`\`\`json
{
  "_id": ObjectId("..."),
  "userId": ObjectId("..."),
  "content": "My daily reflection...",
  "date": "2024-01-15",
  "createdAt": ISODate("..."),
  "updatedAt": ISODate("...")
}
\`\`\`

All data remains on your local machine at localhost:27017!
