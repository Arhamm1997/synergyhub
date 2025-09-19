# MongoDB Atlas Setup Guide

## Step 1: Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up for a free account

## Step 2: Create a Free Cluster
1. Choose "Shared" (Free) option
2. Select your preferred cloud provider (AWS/Google Cloud/Azure)
3. Choose the region closest to you
4. Click "Create Cluster"

## Step 3: Set Up Database Access
1. In the security menu, click "Database Access"
2. Click "Add New Database User"
3. Create a username and password
   - Username: synergyhubAdmin
   - Password: [Generate a secure password]
4. Set user privileges to "Read and write to any database"
5. Click "Add User"

## Step 4: Configure Network Access
1. In the security menu, click "Network Access"
2. Click "Add IP Address"
3. For development, you can click "Allow Access from Anywhere" (Not recommended for production)
4. Click "Confirm"

## Step 5: Get Connection String
1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string
4. Replace <password> with your database user password

## Step 6: Update Environment Variables
Add these to your .env file:

```env
# MongoDB Atlas
MONGODB_URI=mongodb+srv://synergyhubAdmin:<password>@cluster0.mongodb.net/synergyhub?retryWrites=true&w=majority
MONGODB_URI_TEST=mongodb+srv://synergyhubAdmin:<password>@cluster0.mongodb.net/synergyhub_test?retryWrites=true&w=majority
```