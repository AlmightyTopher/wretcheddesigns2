import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

// Initialize Firebase Admin SDK
// Ensure you have set the GOOGLE_APPLICATION_CREDENTIALS environment variable
// pointing to your service account key file.
if (!admin.apps.length) {
  admin.initializeApp({
    // credential: admin.credential.applicationDefault(), // Use this if running locally with GOOGLE_APPLICATION_CREDENTIALS
    // databaseURL: 'YOUR_DATABASE_URL', // Replace with your database URL if needed
  });
}

const db = admin.firestore();

const productsFilePath = path.join(__dirname, '../data/products.json');

async function migrateProductsToFirestore() {
  try {
    const productsData = JSON.parse(fs.readFileSync(productsFilePath, 'utf-8'));

    const productsCollectionRef = db.collection('products');

    // Migrate cups data
    if (productsData.cups && Array.isArray(productsData.cups)) {
      for (const product of productsData.cups) {
        try {
          await productsCollectionRef.doc(product.id).set(product);
          console.log(`Migrated cup product: ${product.name} with ID: ${product.id}`);
        } catch (error) {
          console.error(`Error migrating cup product ${product.name}:`, error);
        }
      }
    }

    // Migrate apparel data
    if (productsData.apparel && Array.isArray(productsData.apparel)) {
      for (const product of productsData.apparel) {
        try {
          await productsCollectionRef.doc(product.id).set(product);
          console.log(`Migrated apparel product: ${product.name} with ID: ${product.id}`);
        } catch (error) {
          console.error(`Error migrating apparel product ${product.name}:`, error);
        }
      }
    }

    console.log('Product migration to Firestore complete.');
  } catch (error) {
    console.error('Error reading products.json or migrating data:', error);
  }
}

migrateProductsToFirestore();