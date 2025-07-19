import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Mock Firebase configuration
const mockFirebaseConfig = {
  apiKey: "mock-api-key",
  authDomain: "mock-auth-domain",
  projectId: "mock-project-id",
  storageBucket: "mock-storage-bucket",
  messagingSenderId: "mock-messaging-sender-id",
  appId: "mock-app-id",
  measurementId: "mock-measurement-id",
};

// Mock the firebase/app module
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(() => ({
    name: 'mock-app',
    options: mockFirebaseConfig,
  })),
}));

// Mock other Firebase service modules
jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => ({})), // Mock Firestore instance
}));
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({})), // Mock Auth instance
}));
jest.mock('firebase/storage', () => ({
  getStorage: jest.fn(() => ({})), // Mock Storage instance
}));

describe('Firebase Initialization', () => {
  beforeEach(() => {
    // Clear mocks before each test
    jest.clearAllMocks();
  });

  test('should initialize Firebase app with correct configuration', () => {
    // Assume your initialization logic calls initializeApp with the config
    // Replace with your actual initialization function call
    initializeApp(mockFirebaseConfig);

    expect(initializeApp).toHaveBeenCalledWith(mockFirebaseConfig);
  });

  test('should initialize Firebase services', () => {
    // Assume your initialization logic calls getFirestore, getAuth, getStorage
    // Replace with your actual initialization function calls if they are separate
    initializeApp(mockFirebaseConfig); // Initialize app first if required by your logic
    getFirestore();
    getAuth();
    getStorage();


    expect(getFirestore).toHaveBeenCalled();
    expect(getAuth).toHaveBeenCalled();
    expect(getStorage).toHaveBeenCalled();
  });

  // Add more tests here for any specific initialization logic
});