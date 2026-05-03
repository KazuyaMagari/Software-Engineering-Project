import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
// Make sure to set the FIREBASE_SERVICE_ACCOUNT_KEY environment variable
// or place the service account JSON file in the appropriate location

const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

export let firebaseInitialized = false;

if (!serviceAccountKey) {
  console.warn(
    'Warning: FIREBASE_SERVICE_ACCOUNT_KEY environment variable not set. ' +
    'Firebase authentication will not work. Please set this environment variable with your service account JSON.'
  );
} else {
  try {
    const serviceAccount = JSON.parse(serviceAccountKey);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    firebaseInitialized = true;
    console.log('✅ Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Firebase Admin SDK:', error);
  }
}

export default admin;
