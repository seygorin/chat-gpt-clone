const fs = require('fs');
const path = require('path');
const glob = require('glob');

const jsFiles = glob.sync('dist/chat-gpt-clone/browser/**/*.js');

console.log('Running environment replacement script...');
console.log(`Found ${jsFiles.length} JS files to process`);

const envVars = {
  GEMINI_API_KEY_PLACEHOLDER: process.env.GEMINI_API_KEY || '',
  FIREBASE_API_KEY_PLACEHOLDER: process.env.FIREBASE_API_KEY || '',
  FIREBASE_AUTH_DOMAIN_PLACEHOLDER: process.env.FIREBASE_AUTH_DOMAIN || '',
  FIREBASE_PROJECT_ID_PLACEHOLDER: process.env.FIREBASE_PROJECT_ID || '',
  FIREBASE_STORAGE_BUCKET_PLACEHOLDER: process.env.FIREBASE_STORAGE_BUCKET || '',
  FIREBASE_MESSAGING_SENDER_ID_PLACEHOLDER: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
  FIREBASE_APP_ID_PLACEHOLDER: process.env.FIREBASE_APP_ID || '',
};

let replacementsCount = 0;

jsFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let modified = false;

  Object.entries(envVars).forEach(([placeholder, value]) => {
    if (content.includes(placeholder)) {
      content = content.replace(new RegExp(placeholder, 'g'), value);
      modified = true;
      replacementsCount++;
    }
  });

  if (modified) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated environment variables in: ${file}`);
  }
});

console.log(`Completed with ${replacementsCount} replacements`);
