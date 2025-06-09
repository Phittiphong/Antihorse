import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
  Modal,
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

interface TransferData {
  recipientAccount: string;
  amount: string;
  note: string;
}

interface TransferScreenProps {
  onBackToDeposit: () => void;
  repeatTx?: any;
}

const TransferScreen: React.FC<TransferScreenProps> = ({ onBackToDeposit, repeatTx }) => {
  const [currentStep, setCurrentStep] = useState<'input' | 'review' | 'processing'>('input');
  const [accountData, setAccountData] = useState<AccountData | null>(null);
  const [recipientData, setRecipientData] = useState<AccountData | null>(null);
  const [transferData, setTransferData] = useState<TransferData>({
    recipientAccount: '',
    amount: '',
    note: '',
  });
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showBlacklistAlert, setShowBlacklistAlert] = useState(false);

  // ดึงข้อมูลบัญชีของผู้ใช้
  const fetchAccountData = async () => {
    try {
      const user = firebase.auth().currentUser;
      if (!user) {
        Alert.alert('Error', 'Please login first');
        return;
      }

      const userRef = firebase.database().ref(`/users/${user.uid}`);
      const snapshot = await userRef.once('value');
      const userData = snapshot.val();

      if (userData) {
        setAccountData(userData);
      } else {
        Alert.alert('Error', 'Account data not found');
      }
    } catch (error) {
      console.error('Error fetching account data:', error);
      Alert.alert('Error', 'Failed to load account data');
    } finally {
      setLoading(false);
    }
  };

  // ค้นหาบัญชีผู้รับ
  const findRecipientAccount = async (accountNumber: string) => {
    try {
      setProcessing(true);
      const usersRef = firebase.database().ref('/users');
      const snapshot = await usersRef.once('value');
      const users = snapshot.val();

      if (users) {
        const recipient = Object.values(users).find((user: any) => 
          user.accnumber === accountNumber
        ) as AccountData | undefined;

        if (recipient) {
          setRecipientData(recipient);
          return true;
        } else {
          Alert.alert('Error', 'Recipient account not found');
          return false;
        }
      }
      return false;
    } catch (error) {
      console.error('Error finding recipient:', error);
      Alert.alert('Error', 'Failed to find recipient account');
      return false;
    } finally {
      setProcessing(false);
    }
  };

  // ตรวจสอบข้อมูลและไปหน้า review
  const handleProceedToReview = async () => {
    if (!transferData.recipientAccount || !transferData.amount) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const amount = parseFloat(transferData.amount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (!accountData || amount > accountData.balance) {
      Alert.alert('Error', 'Insufficient balance');
      return;
    }

    if (transferData.recipientAccount === accountData.accnumber) {
      Alert.alert('Error', 'Cannot transfer to your own account');
      return;
    }

    // ค้นหาบัญชีผู้รับ
    const found = await findRecipientAccount(transferData.recipientAccount);
    if (found) {
      setCurrentStep('review');
    }
  };

  // ดำเนินการโอนเงิน
  const executeTransfer = async () => {
    if (!accountData || !recipientData) return;

    try {
      setCurrentStep('processing');
      const amount = parseFloat(transferData.amount);
      const fee = amount > 1000 ? 10 : 5; // ค่าธรรมเนียม

      // อัพเดทยอดเงินผู้ส่ง
      await firebase.database().ref(`/users/${accountData.accid}`).update({
        balance: accountData.balance - amount - fee,
      });

      // อัพเดทยอดเงินผู้รับ
      await firebase.database().ref(`/users/${recipientData.accid}`).update({
        balance: recipientData.balance + amount,
      });

      // บันทึกประวัติการโอน (อาจจะเพิ่มในอนาคต)
      const transactionId = Date.now().toString();
      const transactionData = {
        id: transactionId,
        from: accountData.accid,
        to: recipientData.accid,
        amount: amount,
        fee: fee,
        note: transferData.note,
        timestamp: new Date().toISOString(),
        status: 'completed',
      };

      // บันทึกใน transactions (optional)
      await firebase.database().ref(`/transactions/${transactionId}`).set(transactionData);

      Alert.alert('Success', 'Transfer completed successfully!', [
        {
          text: 'OK',
          onPress: () => onBackToDeposit(),
        },
      ]);
    } catch (error) {
      console.error('Error executing transfer:', error);
      Alert.alert('Error', 'Transfer failed. Please try again.');
      setCurrentStep('review');
    }
  };

  // ฟังก์ชันเช็ค blacklist
  const checkBlacklist = async (accnumber: string) => {
    try {
      const snap = await firebase.database().ref('/fraud_reports').once('value');
      const data = snap.val() || {};
      const isBlacklisted = Object.values(data).some((r: any) => r.accnumber === accnumber);
      setShowBlacklistAlert(isBlacklisted);
    } catch (e) {
      setShowBlacklistAlert(false);
    }
  };

  useEffect(() => {
    fetchAccountData();
  }, []);

  useEffect(() => {
    if (repeatTx) {
      setTransferData({
        recipientAccount: repeatTx.toInfo?.accnumber || '',
        amount: repeatTx.amount ? String(repeatTx.amount) : '',
        note: repeatTx.note || '',
      });
    }
  }, [repeatTx]);

  useEffect(() => {
    if (currentStep === 'review' && recipientData) {
      checkBlacklist(recipientData.accnumber);
    } else {
      setShowBlacklistAlert(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, recipientData]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1E40AF" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderInputStep = () => (
    <>
      <View style={styles.headerContainer}>
        <View style={styles.headerPlaceholder} />
        <Text style={styles.headerTitle}>Transfer Money</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Recipient Account Number</Text>
          <TextInput
            style={styles.input}
            value={transferData.recipientAccount}
            onChangeText={(text) => setTransferData({ ...transferData, recipientAccount: text })}
            placeholder="Enter 10-digit account number"
            keyboardType="numeric"
            maxLength={10}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Amount (฿)</Text>
          <TextInput
            style={styles.input}
            value={transferData.amount}
            onChangeText={(text) => setTransferData({ ...transferData, amount: text })}
            placeholder="Enter amount"
            keyboardType="numeric"
          />
          <Text style={styles.balanceText}>
            Available Balance: ฿{accountData?.balance?.toLocaleString('th-TH', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Note (Optional)</Text>
          <TextInput
            style={styles.textArea}
            value={transferData.note}
            onChangeText={(text) => setTransferData({ ...transferData, note: text })}
            placeholder="Enter transfer note"
            multiline
            numberOfLines={3}
          />
        </View>

        <TouchableOpacity
          style={styles.proceedButton}
          onPress={handleProceedToReview}
          disabled={processing}
        >
          {processing ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.proceedButtonText}>Review Transfer</Text>
          )}
        </TouchableOpacity>
      </View>
    </>
  );

  const renderReviewStep = () => {
    const amount = parseFloat(transferData.amount);
    const fee = amount > 1000 ? 10 : 5;
    const total = amount + fee;

    return (
      <>
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => setCurrentStep('input')} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Review Transfer</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        <View style={styles.reviewContainer}>
          <View style={styles.reviewCard}>
            <Text style={styles.reviewTitle}>Transfer Details</Text>
            
            <View style={styles.reviewItem}>
              <Text style={styles.reviewLabel}>FROM</Text>
              <Text style={styles.reviewValue}>{accountData?.name}</Text>
              <Text style={styles.reviewSubValue}>{accountData?.accnumber?.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')}</Text>
            </View>

            <View style={styles.reviewItem}>
              <Text style={styles.reviewLabel}>TO</Text>
              <Text style={styles.reviewValue}>{recipientData?.name}</Text>
              <Text style={styles.reviewSubValue}>{recipientData?.accnumber?.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')}</Text>
            </View>

            <View style={styles.reviewItem}>
              <Text style={styles.reviewLabel}>AMOUNT</Text>
              <Text style={styles.reviewValue}>฿{amount.toLocaleString('th-TH', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}</Text>
            </View>

            <View style={styles.reviewItem}>
              <Text style={styles.reviewLabel}>FEE</Text>
              <Text style={styles.reviewValue}>฿{fee.toLocaleString('th-TH', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}</Text>
            </View>

            <View style={[styles.reviewItem, styles.totalItem]}>
              <Text style={styles.reviewLabel}>TOTAL</Text>
              <Text style={[styles.reviewValue, styles.totalValue]}>฿{total.toLocaleString('th-TH', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}</Text>
            </View>

            {transferData.note && (
              <View style={styles.reviewItem}>
                <Text style={styles.reviewLabel}>NOTE</Text>
                <Text style={styles.reviewValue}>{transferData.note}</Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={styles.confirmButton}
            onPress={executeTransfer}
          >
            <Text style={styles.confirmButtonText}>Confirm Transfer</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  };

  const renderProcessingStep = () => (
    <View style={styles.processingContainer}>
      <ActivityIndicator size="large" color="#1E40AF" />
      <Text style={styles.processingText}>Processing Transfer...</Text>
      <Text style={styles.processingSubText}>Please wait while we process your transaction</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {currentStep === 'input' && renderInputStep()}
        {currentStep === 'review' && renderReviewStep()}
        {currentStep === 'processing' && renderProcessingStep()}
      </ScrollView>
      {/* Blacklist Alert Modal */}
      <Modal
        visible={showBlacklistAlert}
        animationType="fade"
        transparent
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 28, minWidth: 300, alignItems: 'center', position: 'relative', borderWidth: 2, borderColor: '#DC2626' }}>
            <TouchableOpacity
              style={{ position: 'absolute', top: 10, right: 10, zIndex: 10 }}
              onPress={() => setShowBlacklistAlert(false)}
            >
              <Text style={{ fontSize: 22, color: '#DC2626', fontWeight: 'bold' }}>×</Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 32, color: '#DC2626', marginBottom: 12 }}>❗</Text>
            <Text style={{ color: '#DC2626', fontWeight: 'bold', fontSize: 18, textAlign: 'center', marginBottom: 4 }}>
              This seller has been blacklisted.
            </Text>
            <Text style={{ color: '#DC2626', fontSize: 15, textAlign: 'center' }}>
              Avoid making any payments.
            </Text>
          </View>
        </View>
      </Modal>
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
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
    width: 40,
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#FF0303',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
    height: 24,
  },
  headerPlaceholder: {
    width: 40,
    height: 24,
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    height: 80,
    textAlignVertical: 'top',
  },
  balanceText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  proceedButton: {
    backgroundColor: '#FF0303',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  proceedButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  reviewContainer: {
    flex: 1,
  },
  reviewCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  reviewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  reviewItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  totalItem: {
    borderBottomWidth: 2,
    borderBottomColor: '#1E40AF',
  },
  reviewLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 4,
  },
  reviewValue: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '600',
  },
  reviewSubValue: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  totalValue: {
    fontSize: 18,
    color: '#1E40AF',
  },
  confirmButton: {
    backgroundColor: '#16A34A',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#6B7280',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  processingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
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

export default TransferScreen;