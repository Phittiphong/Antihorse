// firebase.js
import { initializeApp } from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import database from '@react-native-firebase/database';

// ปกติไม่ต้อง config ด้วยตัวเองเหมือน Web SDK
// เพราะ @react-native-firebase จะอ่าน config จากไฟล์ native ที่ตั้งค่าไว้แล้ว (เช่น google-services.json / GoogleService-Info.plist)

// export ตัวโมดูลต่าง ๆ ออกไปใช้ในโปรเจค
export { auth, firestore, database };
