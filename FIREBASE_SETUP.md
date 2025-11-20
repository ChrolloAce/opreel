# Firebase Setup Instructions

## 1. Enable Firebase Services

Go to [Firebase Console](https://console.firebase.google.com) and:

1. **Enable Google Authentication**:
   - Go to Authentication → Sign-in method
   - Enable "Google" provider
   - Add your authorized domains (localhost, your deployment domain)

2. **Enable Cloud Firestore**:
   - Go to Firestore Database
   - Create database (start in production mode)
   - Deploy the rules from `firestore.rules`

3. **Enable Cloud Storage**:
   - Go to Storage
   - Get Started with Storage
   - Deploy the rules from `storage.rules`

## 2. Deploy Firebase Rules

Install Firebase CLI if you haven't:
\`\`\`bash
npm install -g firebase-tools
firebase login
\`\`\`

Initialize Firebase in your project:
\`\`\`bash
firebase init
\`\`\`
- Select: Firestore, Storage
- Use existing project: op-reel
- Keep default file names

Deploy rules:
\`\`\`bash
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
\`\`\`

## 3. Test Your Setup

1. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

2. Open http://localhost:3006

3. You should see the login screen

4. Click "Continue with Google" to sign in

5. Once logged in, you can:
   - View your content grid
   - Press **Space** to add content
   - Click titles to edit them
   - Click thumbnails to upload images
   - Click the three dots to delete items

## Security Features

✅ **User Isolation**: Each user can only access their own content
✅ **File Size Limits**: 5MB for images, 500MB for videos
✅ **Type Validation**: Only images/videos allowed
✅ **Authentication Required**: All operations require sign-in

## Next Steps

- Deploy to Vercel or your preferred hosting
- Add custom domain to Firebase authorized domains
- Customize the content structure as needed
- Add more features (video upload, analytics, etc.)

