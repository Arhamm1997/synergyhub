# Local MongoDB Setup Guide

## Step 1: Install MongoDB Community Server
1. Download MongoDB Community Server from:
   https://www.mongodb.com/try/download/community

2. Run the installer
   - Choose "Complete" installation
   - Install MongoDB Compass (GUI tool)
   - Add MongoDB to system PATH

## Step 2: Create Data Directory
1. Open PowerShell as Administrator
2. Create data directory:
```powershell
# Create data directory
New-Item -ItemType Directory -Force -Path "C:\data\db"
```

## Step 3: Start MongoDB Service
1. Open PowerShell as Administrator
2. Start MongoDB service:
```powershell
# Start MongoDB service
net start MongoDB
```

## Step 4: Create Database and Collections
1. Open MongoDB Compass
2. Connect to: mongodb://localhost:27017
3. Create new database:
   - Database name: synergyhub
   - Collection name: users

4. Create required collections:
```javascript
// List of collections to create
[
  'users',
  'projects',
  'tasks',
  'clients',
  'businesses',
  'messages',
  'notifications'
]
```

## Step 5: Update Environment Variables
Add these to your .env file:

```env
# Local MongoDB
MONGODB_URI=mongodb://localhost:27017/synergyhub
MONGODB_URI_TEST=mongodb://localhost:27017/synergyhub_test
```

## Step 6: Initialize Database with Indexes

1. Create the initialization script:
```typescript
// src/utils/init-db.ts
import mongoose from 'mongoose';
import { config } from '../config';
import { User } from '../models/user.model';
import { Project } from '../models/project.model';
import { Task } from '../models/task.model';
import { Client } from '../models/client.model';
import { Business } from '../models/business.model';
import { Message } from '../models/message.model';
import { Notification } from '../models/notification.model';

async function initializeDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongoUri);
    console.log('Connected to MongoDB');

    // Create indexes for all models
    await Promise.all([
      User.createIndexes(),
      Project.createIndexes(),
      Task.createIndexes(),
      Client.createIndexes(),
      Business.createIndexes(),
      Message.createIndexes(),
      Notification.createIndexes()
    ]);

    console.log('Database indexes created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

initializeDatabase();
```

2. Run the initialization script:
```bash
npx ts-node src/utils/init-db.ts
```

## Verify Setup
1. Open MongoDB Compass
2. Connect to your database
3. Verify collections are created
4. Check indexes are properly set up

## Troubleshooting
If MongoDB service fails to start:
1. Check if the service is installed:
```powershell
Get-Service MongoDB
```

2. Reinstall service:
```powershell
mongod --remove
mongod --install
```

3. Start service:
```powershell
net start MongoDB
```