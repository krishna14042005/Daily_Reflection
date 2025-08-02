# Daily Reflection App

A Next.js application for daily reflection journaling with MongoDB integration.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- MongoDB running on localhost:27017
- MongoDB Compass (optional, for database visualization)

### Setup Instructions

1. **Install dependencies:**
\`\`\`bash
npm install
\`\`\`

2. **Test MongoDB connection:**
\`\`\`bash
npm run db:test
\`\`\`

3. **Initialize database:**
\`\`\`bash
npm run db:init
\`\`\`

4. **Start the development server:**
\`\`\`bash
npm run dev
\`\`\`

5. **Open your browser:**
Navigate to `http://localhost:3000`

## 📊 Database Structure

### Collections Created:
- **users**: User accounts with authentication
- **reflections**: Daily reflection entries

### MongoDB Connection Details:
- **Host**: localhost:27017
- **Database**: daily_reflection
- **Connection String**: mongodb://localhost:27017

## 🔧 Database Management Commands

\`\`\`bash
# Test MongoDB connection
npm run db:test

# Initialize database and collections
npm run db:init
\`\`\`

## 📱 Features

- ✅ User Authentication (Sign up/Login)
- ✅ Create Daily Reflections
- ✅ View Past Reflections
- ✅ Edit/Delete Reflections
- ✅ Date Filtering
- ✅ Word Count
- ✅ Responsive Design

## 🗄️ Viewing Data in MongoDB Compass

1. Open MongoDB Compass
2. Connect to: `mongodb://localhost:27017`
3. Navigate to database: `daily_reflection`
4. View collections: `users` and `reflections`

## 🐛 Troubleshooting

If you get connection errors:

1. **Check if MongoDB is running:**
   - Windows: `net start MongoDB`
   - macOS: `brew services start mongodb-community`
   - Linux: `sudo systemctl start mongod`

2. **Verify MongoDB Compass connection:**
   - Open MongoDB Compass
   - Connect to `localhost:27017`
   - Check if connection is successful

3. **Run connection test:**
   \`\`\`bash
   npm run db:test
   \`\`\`

## 📁 Project Structure

\`\`\`
├── app/
│   ├── api/auth/          # Authentication endpoints
│   ├── api/reflections/   # Reflection CRUD endpoints
│   ├── login/            # Login page
│   ├── signup/           # Signup page
│   ├── reflections/      # View reflections page
│   └── add-reflection/   # Add reflection page
├── lib/
│   ├── mongodb.ts        # Database connection
│   └── auth.ts          # Authentication utilities
└── scripts/
    ├── init-database.js  # Database initialization
    └── test-connection.js # Connection testing
"# Daily_Reflection" 
