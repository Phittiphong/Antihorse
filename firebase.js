// React Native Firebase configuration
import { getApp, initializeApp } from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import firestore from '@react-native-firebase/firestore';

// Initialize Firebase app if needed
try {
  getApp();
} catch (error) {
  // App not initialized yet, it will be auto-initialized by React Native Firebase
}

// Test database connection and setup
const setupDatabase = () => {
  // Test database connection
  database()
    .ref('.info/connected')
    .on('value', (snapshot) => {
      const connected = snapshot.val();
      console.log('Database connection status:', connected ? 'Connected' : 'Disconnected');
    });

  // Test write permissions
  database()
    .ref('/test')
    .set({
      timestamp: new Date().toISOString(),
      message: 'Database write test'
    })
    .then(() => {
      console.log('Database write test successful');
      // Clean up test data
      database().ref('/test').remove();
    })
    .catch((error) => {
      console.error('Database write test failed:', error);
    });
};

// Initialize database setup
setupDatabase();

// Export Firebase services for use in components
export { auth, database, firestore };
