const fs = require('fs');
const path = require('path');

// Directories to create
const directories = [
  'uploads',
  'logs',
  'src/controllers',
  'src/middleware',
  'src/models',
  'src/routes',
  'src/services',
  'src/utils',
  'src/validations',
  'src/types',
  'src/config'
];

// Create directories
directories.forEach(dir => {
  const fullPath = path.join(__dirname, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`✓ Created directory: ${dir}`);
  } else {
    console.log(`✓ Directory already exists: ${dir}`);
  }
});

// Create .env file if it doesn't exist
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  const envContent = `PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/synergyhub
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
GOOGLE_AI_API_KEY=
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
`;
  
  fs.writeFileSync(envPath, envContent);
  console.log('✓ Created .env file with default values');
} else {
  console.log('✓ .env file already exists');
}

console.log('\n✅ Initialization complete!');
console.log('📝 Please update the .env file with your actual configuration values');
console.log('🚀 You can now run: npm run dev');