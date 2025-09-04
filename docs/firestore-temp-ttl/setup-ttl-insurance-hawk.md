# Setting Up Firestore TTL for Insurance Hawk

## 📋 TTL Setup Checklist

### Prerequisites
- [ ] Firebase CLI installed: `npm install -g firebase-tools`
- [ ] Logged into Firebase: `firebase login`
- [ ] Navigate to your insurance-hawk project directory
- [ ] Know your Firestore database name

### Setup Steps
- [ ] **Step 1**: Run TTL creation command (see below)
- [ ] **Step 2**: Verify TTL policy was created
- [ ] **Step 3**: Test TTL with a test document
- [ ] **Step 4**: Update your visitor document creation code
- [ ] **Step 5**: Confirm existing visitor docs have `expiresAt` field

## ✅ **Compatibility Check**

Based on your insurance-hawk codebase analysis:

- ✅ **Database**: `temp` (matches your setup)
- ✅ **Collection**: `visitors` (matches your `COLLECTION_NAME`)
- ✅ **Field**: `expiresAt` (already implemented as Firestore Timestamp)
- ✅ **TTL**: 24 hours (matches your `TTL_HOURS = 24`)
- ✅ **Data Structure**: Perfect for TTL with subcollections

Your existing code in `temporary-storage.ts` already creates documents with `expiresAt` timestamps, so TTL will work immediately!

### Verification Checklist
- [ ] TTL policy shows up in Firebase Console
- [ ] Test document gets deleted automatically
- [ ] Production visitor docs include `expiresAt` timestamp
- [ ] TTL deletion working within 24 hours
- [ ] Manual cleanup code can be removed (optional)

---

## 🚀 Quick Start Commands

### Step 1: Create TTL Policy

**Option A: Firebase Console (Recommended)**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Firestore Database**
4. Click on the **"TTL"** tab in the left sidebar
5. Click **"Create TTL Policy"**
6. Configure the policy:
   - **Collection Group**: `visitors`
   - **Field**: `expiresAt`
   - **Database**: `temp`
   - **Apply to subcollections**: ✅ Enabled (important for quote data)
7. Click **"Create Policy"**

**Option B: Google Cloud CLI (Alternative)**

If you have gcloud CLI installed:

```bash
# Create TTL policy using gcloud (replace PROJECT_ID with your actual project ID)
gcloud firestore databases ttl create \
  --database=temp \
  --collection-group=visitors \
  --field=expiresAt \
  --project=YOUR_PROJECT_ID
```

**Note**: Firebase CLI doesn't support TTL commands yet, so use the Console method.

### Step 2: Verify TTL Policy Created

**Option A: Firebase Console**

1. Go to Firebase Console > Firestore Database > TTL tab
2. You should see your TTL policy listed with:
   - Collection Group: `visitors`
   - Field: `expiresAt`
   - Database: `temp`

**Option B: Google Cloud CLI (if available)**

```bash
# Check if TTL policy was created successfully
gcloud firestore databases ttl list --database=temp --project=YOUR_PROJECT_ID
```

### Step 3: Test TTL with Sample Document

Create a test document to verify TTL is working:

```javascript
// In your insurance-hawk app, you can run this test
const testTTL = async () => {
  const db = getFirestore();
  
  // Create a test document that expires in 2 minutes
  const testDoc = {
    testData: "This should be deleted automatically",
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 2 * 60 * 1000) // 2 minutes from now
  };
  
  await setDoc(doc(db, 'visitors', 'ttl-test'), testDoc);
  console.log('TTL test document created. Check back in 2-3 minutes - it should be gone!');
};
```

### Step 4: Update Visitor Document Creation

```javascript
// When creating visitor quote data in your insurance-hawk app
const visitorData = {
  // ... your existing visitor data
  createdAt: new Date(),
  expiresAt: new Date(Date.now() + (24 * 60 * 60 * 1000)) // 24 hours from now
};

await setDoc(doc(db, 'visitors', visitorId), visitorData);
```

---

## ⚠️ Important Notes Checklist

- [ ] **TTL deletion happens within 24 hours** of expiration (not immediately)
- [ ] **TTL works server-side** - no additional app code needed  
- [ ] **No extra costs** for the deletion process
- [ ] **TTL applies to subcollections** if enabled
- [ ] **Field must be Timestamp/Date type** 
- [ ] **Test with short expiration first** (2 minutes) to verify it works

---

## 🔧 Management Commands

## 🔧 Management Commands

### Check Active TTL Policies

**Firebase Console**: Go to Firestore Database > TTL tab

**Google Cloud CLI** (if available):
```bash
gcloud firestore databases ttl list --database=temp --project=YOUR_PROJECT_ID
```

### Delete TTL Policy (if needed)

**Firebase Console**: Go to TTL tab > Find your policy > Click "Delete"

**Google Cloud CLI** (if available):
```bash
gcloud firestore databases ttl delete \
  --database=temp \
  --collection-group=visitors \
  --project=YOUR_PROJECT_ID
```

---

## ✅ Success Indicators

You'll know TTL is working when:
- [ ] CLI command runs without errors
- [ ] TTL policy appears in `ttl:list` command output
- [ ] Test documents disappear within 24 hours of expiration
- [ ] Firebase Console shows TTL policy under Firestore > TTL tab
- [ ] Old visitor documents start getting cleaned up automatically
