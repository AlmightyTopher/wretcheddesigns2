import * as admin from 'firebase-admin';

// Ensure your Firebase Admin SDK service account key is set up in environment variables.
// For example, you can stringify the JSON key and store it in FIREBASE_ADMIN_CONFIG.
// Or store individual fields like FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_PRIVATE_KEY, FIREBASE_ADMIN_CLIENT_EMAIL.

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  // Replace newline characters in the private key with actual newlines if it's stored as a single string.
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      // Optionally, add databaseURL if you use Realtime Database with Admin SDK
      // databaseURL: process.env.FIREBASE_DATABASE_URL,
    });
    console.log("Firebase Admin SDK Initialized.");
  } catch (error: any) {
    console.error("Firebase Admin SDK initialization error:", error.stack);
    // Optionally, throw the error or handle it as per your application's needs
    // throw new Error("Firebase Admin SDK failed to initialize");
  }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore(); // If you need to interact with Firestore with admin privileges
// Export other admin services as needed, e.g., admin.storage()
