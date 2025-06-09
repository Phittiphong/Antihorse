import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import firebase from '../../firebase';

interface AccountData {
  accid: string;
  accnumber: string;
  balance: number;
  email: string;
  name: string;
  pin: string;
}

interface DepositScreenProps {
  onNavigateToTransfer: () => void;
  onNavigateToHistory: () => void;
  isPinVerified: boolean;
  setIsPinVerified: (v: boolean) => void;
  didShowPinVerifyModal: boolean;
  setDidShowPinVerifyModal: (v: boolean) => void;
}

const DepositScreen: React.FC<DepositScreenProps> = ({ onNavigateToTransfer, onNavigateToHistory, isPinVerified, setIsPinVerified, didShowPinVerifyModal, setDidShowPinVerifyModal }) => {
  const [accountData, setAccountData] = useState<AccountData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAccountNumber, setShowAccountNumber] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [showVerifyPinModal, setShowVerifyPinModal] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [verifyPin, setVerifyPin] = useState('');
  const [pendingAction, setPendingAction] = useState<'none' | 'history'>('none');
  const [showReportFraudModal, setShowReportFraudModal] = useState(false);
  const [fraudAccNumber, setFraudAccNumber] = useState('');
  const [fraudName, setFraudName] = useState('');
  const [fraudAmount, setFraudAmount] = useState('');
  const [showReportHistoryModal, setShowReportHistoryModal] = useState(false);
  const [fraudReports, setFraudReports] = useState<any[]>([]);
  const [userMap, setUserMap] = useState<{ [uid: string]: string }>({});

  // สร้างเลขบัญชีสำหรับผู้ใช้ (10 หลัก)
  const generateAccountNumber = (userId: string): string => {
    // ใช้ userId เป็น seed เพื่อให้ได้เลขบัญชีที่ถาวร
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    // แปลงให้เป็นเลข 10 หลัก
    const accountNumber = Math.abs(hash).toString().padStart(10, '0').slice(0, 10);
    return accountNumber;
  };

  // ดึงข้อมูลบัญชี
  const fetchAccountData = async () => {
    try {
      console.log('Starting fetchAccountData...');
      
      const user = firebase.auth().currentUser;
      console.log('Current user:', user ? user.uid : 'No user');
      
      if (!user) {
        Alert.alert('Error', 'Please login first');
        setLoading(false);
        return;
      }

      console.log('Fetching data for user:', user.uid);
      
      // สร้างบัญชีใหม่ทันทีถ้ายังไม่มีข้อมูล (offline mode)
      const accountNumber = generateAccountNumber(user.uid);
      const fallbackAccountData: AccountData = {
        accid: user.uid,
        accnumber: accountNumber,
        balance: 1000,
        email: user.email || '',
        name: user.displayName || 'Account Holder',
        pin: '0000' // Default PIN
      };

      try {
        const userRef = firebase.database().ref(`/users/${user.uid}`);
        
        // ลดเวลา timeout ลง
        const timeoutPromise = new Promise<any>((_, reject) => 
          setTimeout(() => reject(new Error('Database timeout after 5 seconds')), 5000)
        );
        
        const dataPromise = userRef.once('value');
        const snapshot = await Promise.race([dataPromise, timeoutPromise]) as any;
        console.log('Database snapshot received');
        
        const userData = snapshot.val();
        console.log('User data:', userData);

        if (userData && userData.accnumber) {
          setAccountData({
            accid: userData.accid || user.uid,
            accnumber: userData.accnumber,
            balance: userData.balance || 0,
            email: userData.email || user.email || '',
            name: userData.name || user.displayName || 'Account Holder',
            pin: userData.pin || '0000',
          });
          console.log('Account data loaded from database');
        } else {
          console.log('No data found, creating new account...');
          await createNewAccount(user.uid, user.displayName || 'Account Holder', user.email || '');
        }
      } catch (dbError: any) {
        console.warn('Database error, using fallback data:', dbError.message);
        // ใช้ข้อมูล fallback ถ้าไม่สามารถเชื่อมต่อ database ได้
        setAccountData(fallbackAccountData);
        Alert.alert(
          'Offline Mode', 
          'Using cached account data. Database connection failed.',
          [{ text: 'OK' }]
        );
      }
      
    } catch (error: any) {
      console.error('Error fetching account data:', error);
      Alert.alert('Error', `Failed to load account data: ${error?.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  // สร้างบัญชีใหม่
  const createNewAccount = async (userId: string, displayName: string, email: string) => {
    try {
      console.log('Creating new account for user:', userId);
      const accountNumber = generateAccountNumber(userId);
      const initialBalance = 1000; // ยอดเงินเริ่มต้น

      const userData: AccountData = {
        accid: userId,
        accnumber: accountNumber,
        balance: initialBalance,
        email: email,
        name: displayName,
        pin: '0000', // Default PIN
      };

      console.log('Account data to save:', userData);

      try {
        console.log('Attempting to save to Firebase...');
        const userRef = firebase.database().ref(`/users/${userId}`);
        await userRef.set(userData);
        console.log('Account created in database successfully');
        
        // Verify the data was saved
        const verifySnapshot = await userRef.once('value');
        const savedData = verifySnapshot.val();
        console.log('Verified saved data:', savedData);
          } catch (dbError: any) {
        console.error('Database save error details:', dbError);
        console.warn('Failed to save to database, using local data:', dbError);
        Alert.alert('Database Error', `Failed to save to database: ${dbError.message}`);
      }

      setAccountData(userData);

      Alert.alert('Success', 'New account created successfully!');
    } catch (error) {
      console.error('Error creating account:', error);
      Alert.alert('Error', 'Failed to create account');
    }
  };

  // รีเฟรชข้อมูล
  const onRefresh = () => {
    setRefreshing(true);
    fetchAccountData();
  };
  // เพิ่มเงิน (สำหรับทดสอบ)
  const addMoney = async (amount: number) => {
    // ตรวจสอบ PIN ก่อนทำงาน
    if (accountData && accountData.pin !== '0000' && !isPinVerified) {
      Alert.alert('PIN Required', 'Please verify your PIN first');
      setShowVerifyPinModal(true);
      return;
    }

    try {
      const user = firebase.auth().currentUser;
      if (!user || !accountData) return;

      const newBalance = accountData.balance + amount;
      
      try {
        await firebase.database().ref(`/users/${user.uid}`).update({
          balance: newBalance,
        });
        console.log('Balance updated in database successfully');
      } catch (dbError) {
        console.warn('Failed to update database, using local data:', dbError);
      }

      setAccountData({
        ...accountData,
        balance: newBalance,
      });

      Alert.alert('Success', `Added ฿${amount.toLocaleString()} to your account`);
    } catch (error) {
      console.error('Error adding money:', error);
      Alert.alert('Error', 'Failed to add money');
    }
  };
  // เพิ่ม PIN ใหม่
  const handleAddPin = async () => {
    try {
      if (newPin.length !== 6) {
        Alert.alert('Error', 'PIN must be exactly 6 digits');
        return;
      }

      const user = firebase.auth().currentUser;
      if (!user || !accountData) return;

      try {
        await firebase.database().ref(`/users/${user.uid}`).update({
          pin: newPin,
        });
        
        setAccountData({
          ...accountData,
          pin: newPin,
        });

        setNewPin('');
        setShowPinModal(false);
        setIsPinVerified(true); // Auto verify after setting new PIN
        Alert.alert('Success', 'PIN has been set successfully!');
      } catch (error) {
        console.error('Error updating PIN:', error);
        Alert.alert('Error', 'Failed to update PIN');
      }
    } catch (error) {
      console.error('Error in PIN setting:', error);
    }
  };  // ตรวจสอบ PIN
  const handleVerifyPin = async () => {
    try {
      if (!accountData) return;

      if (verifyPin === accountData.pin) {
        setIsPinVerified(true);
        setVerifyPin('');
        setShowVerifyPinModal(false);
        // Execute pending action
        if (pendingAction === 'history') {
          setPendingAction('none');
          onNavigateToHistory();
        } else {
          Alert.alert('Success', 'PIN verified successfully!');
        }
      } else {
        Alert.alert('Error', 'Incorrect PIN. Please try again.');
        setVerifyPin('');
      }
    } catch (error) {
      console.error('Error verifying PIN:', error);
    }
  };

  // ตรวจสอบการเข้าถึงฟีเจอร์
  const checkPinAccess = () => {
    if (accountData && accountData.pin !== '0000' && !isPinVerified) {
      Alert.alert('PIN Required', 'Please verify your PIN to access this feature');
      setShowVerifyPinModal(true);
      return false;
    }
    return true;
  };

  // ออกจากระบบ
  const handleLogout = async () => {
    try {
      setShowDropdown(false);
      Alert.alert(
        'Confirm Logout',
        'Are you sure you want to logout?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Logout',
            onPress: async () => {
              try {
                await firebase.auth().signOut();
                setDidShowPinVerifyModal(false);
                setIsPinVerified(false);
                console.log('User logged out successfully');
              } catch (error) {
                console.error('Error logging out:', error);
                Alert.alert('Error', 'Failed to logout');
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error in logout process:', error);
    }
  };

  // ฟังก์ชันสำหรับส่งข้อมูล fraud
  const handleSubmitFraudReport = async () => {
    if (!fraudAccNumber || !fraudName || !fraudAmount) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    try {
      const reportId = Date.now().toString();
      await firebase.database().ref(`/fraud_reports/${reportId}`).set({
        accnumber: fraudAccNumber,
        name: fraudName,
        amount: fraudAmount,
        reportedAt: new Date().toISOString(),
        reporter: firebase.auth().currentUser?.uid || 'anonymous',
      });
      setShowReportFraudModal(false);
      setFraudAccNumber('');
      setFraudName('');
      setFraudAmount('');
      Alert.alert('Success', 'Fraud report submitted!');
    } catch (e) {
      Alert.alert('Error', 'Failed to submit fraud report');
    }
  };

  // ฟังก์ชันโหลดประวัติการรีพอร์ตและชื่อผู้ใช้
  const loadFraudReports = async () => {
    try {
      const [snap, usersSnap] = await Promise.all([
        firebase.database().ref('/fraud_reports').once('value'),
        firebase.database().ref('/users').once('value'),
      ]);
      const data = snap.val() || {};
      const users = usersSnap.val() || {};
      const userMap: { [uid: string]: string } = {};
      Object.values(users).forEach((u: any) => {
        userMap[u.accid] = u.name || u.email || u.accid;
      });
      setUserMap(userMap);
      setFraudReports(Object.values(data).sort((a: any, b: any) => (b.reportedAt || '').localeCompare(a.reportedAt || '')));
    } catch (e) {
      setFraudReports([]);
      setUserMap({});
    }
  };

  useEffect(() => {
    console.log('DepositScreen mounted, checking auth state...');
    
    // Check auth state first
    const checkAuthAndFetch = async () => {
      try {
        const user = firebase.auth().currentUser;
        console.log('Auth check - Current user:', user ? user.uid : 'No user logged in');
        
        if (!user) {
          console.log('No user found, waiting for auth state...');
          // Wait a bit for auth state to settle
          setTimeout(() => {
            const retryUser = firebase.auth().currentUser;
            if (retryUser) {
              console.log('User found on retry:', retryUser.uid);
              fetchAccountData();
            } else {
              console.log('Still no user after retry');
              setLoading(false);
              Alert.alert('Authentication Error', 'Please log in first');
            }
          }, 2000);
        } else {
          fetchAccountData();
        }
      } catch (error) {
        console.error('Error in checkAuthAndFetch:', error);
        setLoading(false);
      }
    };

    checkAuthAndFetch();
  }, []);

  // เช็ค PIN เมื่อได้ข้อมูลบัญชีแล้ว
  useEffect(() => {
    if (
      accountData &&
      accountData.pin !== '0000' &&
      !isPinVerified &&
      !didShowPinVerifyModal
    ) {
      setShowVerifyPinModal(true);
      setDidShowPinVerifyModal(true);
    }
  }, [accountData, isPinVerified, didShowPinVerifyModal, setDidShowPinVerifyModal]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1E40AF" />
          <Text style={styles.loadingText}>Loading account...</Text>
        </View>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        scrollEnabled={!accountData || accountData.pin === '0000' || isPinVerified}
      >
        <View style={[styles.header, { justifyContent: 'center' }]}>
          <Text style={styles.headerTitle}>My Account</Text>
        </View>
        <View style={styles.accountCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.bankIcon}>🏦</Text>
            <Text style={styles.bankName}>AntiHorse Bank</Text>
          </View>
          <View style={styles.accountInfo}>
            <Text style={styles.accountLabel}>Account Number</Text>
            <View style={styles.accountNumberContainer}>
              <Text style={styles.accountNumber}>
                {showAccountNumber 
                  ? accountData?.accnumber?.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')
                  : `xxx-xxx-${accountData?.accnumber?.slice(-4) || ''}`
                }
              </Text>
              <TouchableOpacity 
                onPress={() => setShowAccountNumber(!showAccountNumber)}
                style={styles.eyeButton}
              >
                <Text style={styles.eyeIcon}>
                  {showAccountNumber ? '🙈' : '👁️'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.accountInfo}>
            <Text style={styles.accountLabel}>Account Name</Text>
            <Text style={styles.accountName}>{accountData?.name}</Text>
          </View>
          <View style={styles.balanceSection}>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <Text style={styles.balanceAmount}>
              ฿{accountData?.balance?.toLocaleString('th-TH', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
          </View>
          <Text style={styles.lastUpdated}>
            Account ID: {accountData?.accid}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  refreshButton: {
    marginRight: 16,
    padding: 8,
  },
  refreshIcon: {
    fontSize: 20,
    color: '#1E40AF',
  },
  menuButton: {
    padding: 8,
  },
  menuIcon: {
    fontSize: 24,
    color: '#1E40AF',
    fontWeight: 'bold',
  },
  accountCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  bankName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF0303',
    marginLeft: 12,
  },
  accountInfo: {
    marginBottom: 16,
  },
  accountLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  accountNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    fontFamily: 'monospace',
    flex: 1,
  },
  accountNumberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eyeButton: {
    padding: 8,
    marginLeft: 12,
  },
  eyeIcon: {
    fontSize: 20,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  balanceSection: {
    marginTop: 24,
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#16A34A',
  },
  lastUpdated: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 16,
  },
  actionsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonText: {
    fontSize: 12,
    color: '#16A34A',
    fontWeight: '500',
    marginTop: 8,
  },
  actionIcon: {
    fontSize: 20,
    marginBottom: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    maxWidth: 320,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 24,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
    textAlign: 'center',
  },
  pinInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 16,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: 'monospace',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  saveButton: {
    backgroundColor: '#16A34A',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    flex: 1,
    marginRight: 8,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  verifyButton: {
    backgroundColor: '#1E40AF',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    flex: 1,
    marginRight: 8,
  },
  verifyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  cancelButton: {
    backgroundColor: '#6B7280',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    flex: 1,
    marginLeft: 8,
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  bankIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  processingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 20,
  },
  processingSubText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default DepositScreen;