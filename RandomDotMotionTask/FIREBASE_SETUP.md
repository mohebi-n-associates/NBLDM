# 🔥 Firebase Setup Guide

This guide will help you enable data collection and population comparison for the Random Dot Motion Task.

**Time required:** ~10 minutes  
**Cost:** Free (Firebase free tier is very generous)

---

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Create a project"** (or "Add project")
3. Name it something like `dot-motion-task` or `nbldm-experiments`
4. Disable Google Analytics (not needed) or enable if you want
5. Click **Create project**

---

## Step 2: Add a Web App

1. In your project dashboard, click the **web icon** `</>` to add a web app
2. Give it a nickname (e.g., "dot-motion-web")
3. **Don't** check "Firebase Hosting" (we're using GitHub Pages)
4. Click **Register app**
5. You'll see a config object like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyD...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

6. **Copy these values** — you'll need them in Step 5

---

## Step 3: Enable Firestore Database

1. In the left sidebar, click **"Build" → "Firestore Database"**
2. Click **"Create database"**
3. Choose **"Start in test mode"** (we'll secure it later)
4. Select a location close to your users (e.g., `us-central` for US)
5. Click **Enable**

---

## Step 4: Enable Anonymous Authentication

1. In the left sidebar, click **"Build" → "Authentication"**
2. Click **"Get started"**
3. In the "Sign-in method" tab, click **"Anonymous"**
4. Toggle **Enable** to ON
5. Click **Save**

---

## Step 5: Add Your Config to the Code

Open `index.html` and find this section near the top:

```javascript
const firebaseConfig = {
    // ⚠️ REPLACE THESE WITH YOUR FIREBASE CONFIG ⚠️
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

Replace with your actual values from Step 2.

---

## Step 6: Set Up Security Rules (Important!)

Go to **Firestore Database → Rules** and replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow anyone to read population data
    match /dot_motion_results/{document=**} {
      allow read: if true;
      // Allow authenticated users to create new results
      allow create: if request.auth != null;
      // Don't allow updates or deletes
      allow update, delete: if false;
    }
  }
}
```

Click **Publish**.

This allows:
- ✅ Anyone can read (for population comparison)
- ✅ Logged-in users can submit results
- ❌ No one can modify or delete existing data

---

## Step 7: Test It!

1. Push your updated `index.html` to GitHub
2. Wait for GitHub Pages to redeploy (~1 min)
3. Open your site and complete the task
4. Check Firebase Console → Firestore to see your data!

---

## Viewing the Data

### In Firebase Console
Go to **Firestore Database** to see all submissions in a nice table format.

### Export to CSV/Excel
1. Install the [Firestore Export Tool](https://github.com/benwinding/firestore-export-import) or use the Firebase Admin SDK
2. Or use this simple approach:
   - In Firestore, click on the collection
   - Click the three dots menu → "Export"

### Query with Code
You can run queries directly in the Firebase Console:

```javascript
// Find all results with >80% accuracy
db.collection('dot_motion_results')
  .where('accuracy', '>', 0.8)
  .get()
```

---

## Troubleshooting

### "Connection error" badge
- Check that your config values are correct
- Make sure Anonymous auth is enabled
- Check browser console for specific errors

### Data not saving
- Verify Firestore is in "test mode" or rules are correct
- Check that the collection name matches (`dot_motion_results`)

### Population data not loading
- Need at least 2 submissions to show histograms
- Check that coherence level matches (population data is filtered by coherence)

---

## Cost Estimates

Firebase free tier includes:
- **50,000 reads/day** (loading population data)
- **20,000 writes/day** (saving results)
- **1 GB storage**

For a class of 100 students running 10 experiments each = ~2,000 writes total. You won't come close to the limits.

---

## Optional: Create Indexes for Better Performance

If you have thousands of submissions, create a composite index:

1. Go to **Firestore → Indexes**
2. Click **Create index**
3. Collection: `dot_motion_results`
4. Fields: `coherence` (Ascending), `timestamp` (Descending)
5. Click **Create**

---

## Data Schema

Each submission saves:

| Field | Type | Description |
|-------|------|-------------|
| `participantId` | string | Anonymous unique ID |
| `participantName` | string | Optional name |
| `coherence` | number | 0.0 to 1.0 |
| `stimulusDuration` | number | ms |
| `accuracy` | number | 0.0 to 1.0 |
| `meanRT` | number | ms |
| `correctRT` | number | ms (correct trials only) |
| `trials` | array | Full trial-by-trial data |
| `timestamp` | timestamp | When submitted |

---

## Questions?

Firebase has excellent documentation: https://firebase.google.com/docs

For course-specific questions, contact the instructor.
