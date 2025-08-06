# MongoDB Atlas Setup Guide for Civicfix

This guide will help you connect your Civicfix application to MongoDB Atlas.

## 🚀 Quick Start

### 1. Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Sign up for a free account
3. Create a new project called "Civicfix"

### 2. Create a Database Cluster

1. Click "Build a Database"
2. Choose **FREE** shared cluster
3. Select your preferred cloud provider and region
4. Name your cluster (e.g., "civicfix-cluster")
5. Click "Create Cluster"

### 3. Set Up Database Access

1. Go to **Database Access** in the left sidebar
2. Click "Add New Database User"
3. Choose **Password** authentication
4. Create username and password (save these!)
5. Set role to **Read and write to any database**
6. Click "Add User"

### 4. Configure Network Access

1. Go to **Network Access** in the left sidebar
2. Click "Add IP Address"
3. Choose **Allow Access from Anywhere** (0.0.0.0/0)
   - For production, restrict to specific IPs
4. Click "Confirm"

### 5. Get Connection String

1. Go to **Database** in the left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Select **Node.js** as driver and **4.1 or later** as version
5. Copy the connection string

### 6. Configure Environment Variables

Replace the connection string in your `.env` file:

```bash
# Replace these values with your actual MongoDB Atlas credentials
MONGODB_URI=mongodb+srv://<username>:<password>@civicfix-cluster.xxxxx.mongodb.net/civicfix?retryWrites=true&w=majority

# Generate a secure JWT secret (32+ characters)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-make-it-long-and-random

# Other configuration
JWT_EXPIRES_IN=7d
PORT=8080
NODE_ENV=development
```

**Important:** Replace:
- `<username>` with your database username
- `<password>` with your database password
- `xxxxx` with your actual cluster identifier
- `JWT_SECRET` with a secure random string

### 7. Install Dependencies & Seed Database

```bash
# Install dependencies (if not already done)
npm install

# Seed the database with sample data
npm run seed

# Start the development server
npm run dev
```

## 📊 Database Structure

The application will automatically create these collections:
- **users** - User accounts and profiles
- **issues** - Civic issues reported by users
- **votes** - User votes on issues
- **comments** - Comments and discussions
- **categories** - Issue categorization

## 🔒 Security Best Practices

### For Development
- Use the provided `.env` file with your credentials
- Never commit `.env` to version control

### For Production
1. **Restrict Network Access**
   - Remove 0.0.0.0/0 access
   - Add only your server's IP addresses

2. **Use Strong Credentials**
   - Generate complex database passwords
   - Use a cryptographically secure JWT secret

3. **Enable Database Monitoring**
   - Set up alerts for unusual activity
   - Monitor connection patterns

## 🛠️ Troubleshooting

### Connection Issues

**Error: "MongoNetworkError"**
- Check if your IP is whitelisted in Network Access
- Verify the connection string format
- Ensure username/password are correct

**Error: "Authentication failed"**
- Verify database user credentials
- Check if user has proper permissions
- Ensure password doesn't contain special characters that need URL encoding

### Environment Variables

**Variables not loading:**
```bash
# Check if .env file exists and has correct format
cat .env

# Restart the development server
npm run dev
```

**Invalid connection string:**
- Copy connection string directly from Atlas
- Replace `<password>` with actual password
- Encode special characters in password

### Database Operations

**Seeding fails:**
```bash
# Check MongoDB connection
npm run seed

# Clear and re-seed if needed
# (The seed script automatically clears existing data)
```

## 📋 API Endpoints

Once connected, these endpoints will be available:

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Sign in user
- `GET /api/auth/me` - Get current user
- `PATCH /api/auth/profile` - Update profile
- `POST /api/auth/logout` - Sign out

### Issues
- `GET /api/issues` - List issues (with filtering/sorting)
- `GET /api/issues/:id` - Get single issue
- `POST /api/issues` - Create new issue (auth required)
- `POST /api/issues/:id/vote` - Vote on issue (auth required)
- `GET /api/issues/:id/comments` - Get issue comments
- `POST /api/issues/:id/comments` - Add comment (auth required)

### Categories
- `GET /api/categories` - List all categories
- `GET /api/categories/:id` - Get single category

### Health Check
- `GET /api/health` - Server status
- `GET /api/demo` - Simple test endpoint

## 🔄 Development Workflow

1. **Start Development:**
   ```bash
   npm run dev
   ```

2. **Make Database Changes:**
   - Models are in `server/models/`
   - Routes are in `server/routes/`
   - Update and restart server

3. **Reset Database:**
   ```bash
   npm run seed
   ```

4. **Test API:**
   - Use browser for GET requests
   - Use Postman/Insomnia for POST/PATCH requests
   - Check `http://localhost:8080/api/health`

## 🏗️ Production Deployment

For production deployment:

1. **Set up production MongoDB Atlas cluster**
2. **Configure environment variables on your hosting platform**
3. **Run build process:**
   ```bash
   npm run build
   npm start
   ```

The application will:
- Serve the built React app from `/dist/spa`
- Handle API requests on `/api/*`
- Connect to your production MongoDB Atlas cluster

## 📞 Support

If you encounter issues:

1. Check the [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
2. Verify your connection string format
3. Ensure network access is properly configured
4. Check server logs for detailed error messages

## 🎯 Next Steps

After successful setup:
1. Test authentication by creating a user account
2. Create sample issues through the UI
3. Test voting and commenting functionality
4. Explore the admin features (if applicable)
5. Customize the data models for your specific needs

Your Civicfix application is now connected to MongoDB Atlas and ready for development!
