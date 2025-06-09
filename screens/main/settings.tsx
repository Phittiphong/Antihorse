import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Modal, TextInput, Alert, ActivityIndicator, FlatList } from 'react-native';
import firebase from '../../firebase';

const SettingsScreen: React.FC = () => {
  const [showPinModal, setShowPinModal] = useState(false);
  const [showChangePinModal, setShowChangePinModal] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [oldPin, setOldPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isPinVerified, setIsPinVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [accountData, setAccountData] = useState<any>(null);
  const [showReportFraudModal, setShowReportFraudModal] = useState(false);
  const [fraudAccNumber, setFraudAccNumber] = useState('');
  const [fraudName, setFraudName] = useState('');
  const [fraudAmount, setFraudAmount] = useState('');
  const [showReportHistoryModal, setShowReportHistoryModal] = useState(false);
  const [fraudReports, setFraudReports] = useState<any[]>([]);
  const [userNames, setUserNames] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchAccountData = async () => {
      try {
        const user = firebase.auth().currentUser;
        if (!user) {
          setLoading(false);
          return;
        }
        const userRef = firebase.database().ref(`/users/${user.uid}`);
        const snapshot = await userRef.once('value');
        setAccountData(snapshot.val());
      } catch (e) {
        setAccountData(null);
      }
      setLoading(false);
    };
    fetchAccountData();
  }, []);

  const handleAddPin = async () => {
    try {
      if (newPin.length !== 6) {
        Alert.alert('Error', 'PIN must be exactly 6 digits');
        return;
      }
      const user = firebase.auth().currentUser;
      if (!user || !accountData) return;
      await firebase.database().ref(`/users/${user.uid}`).update({ pin: newPin });
      setAccountData({ ...accountData, pin: newPin });
      setNewPin('');
      setShowPinModal(false);
      setIsPinVerified(true);
      Alert.alert('Success', 'PIN has been set successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update PIN');
    }
  };

  const handleChangePin = async () => {
    try {
      if (oldPin.length !== 6 || newPin.length !== 6 || confirmPin.length !== 6) {
        Alert.alert('Error', 'PINs must be exactly 6 digits');
        return;
      }
      if (newPin !== confirmPin) {
        Alert.alert('Error', 'New PIN and Confirm PIN do not match');
        return;
      }
      const user = firebase.auth().currentUser;
      if (!user || !accountData) return;

      const userRef = firebase.database().ref(`/users/${user.uid}`);
      const snapshot = await userRef.once('value');
      const currentAccountData = snapshot.val();

      if (oldPin !== currentAccountData.pin) {
        Alert.alert('Error', 'Incorrect Old PIN');
        setOldPin('');
        setNewPin('');
        setConfirmPin('');
        return;
      }

      await userRef.update({ pin: newPin });
      setAccountData({ ...currentAccountData, pin: newPin });
      setOldPin('');
      setNewPin('');
      setConfirmPin('');
      setShowChangePinModal(false);
      Alert.alert('Success', 'PIN has been changed successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to change PIN');
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          onPress: async () => {
            try {
              await firebase.auth().signOut();
              setIsPinVerified(false);
              Alert.alert('Logged out', 'You have been logged out.');
            } catch (error) {
              Alert.alert('Error', 'Failed to logout');
            }
          },
        },
      ]
    );
  };

  const handleSubmitFraudReport = async () => {
    if (!fraudAccNumber || !fraudName || !fraudAmount) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    try {
      const reportId = Date.now().toString();
      const user = firebase.auth().currentUser;
      await firebase.database().ref(`/fraud_reports/${reportId}`).set({
        accnumber: fraudAccNumber,
        name: fraudName,
        amount: fraudAmount,
        reportedAt: new Date().toISOString(),
        reporter: user ? user.uid : 'anonymous',
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

  const loadFraudReports = async () => {
    setLoading(true);
    try {
      const [reportsSnap, usersSnap] = await Promise.all([
        firebase.database().ref('/fraud_reports').once('value'),
        firebase.database().ref('/users').once('value'),
      ]);
      const reportsData = reportsSnap.val() || {};
      const usersData = usersSnap.val() || {};

      const names: { [key: string]: string } = {};
      for (const uid in usersData) {
        names[uid] = usersData[uid].name || 'Unknown User';
      }
      setUserNames(names);

      const reportsList = Object.values(reportsData).sort((a: any, b: any) => (b.reportedAt || '').localeCompare(a.reportedAt || ''));
      setFraudReports(reportsList);

    } catch (e) {
      setFraudReports([]);
      setUserNames({});
      Alert.alert('Error', 'Failed to load fraud reports.');
    }
    setLoading(false);
  };

  const handleViewReportHistory = () => {
    setShowReportHistoryModal(true);
    loadFraudReports();
  };

  const renderReportItem = ({ item }: { item: any }) => (
    <View style={styles.reportItem}>
      <Text style={styles.reportItemTitle}>Fraud Report</Text>
      <Text style={styles.reportItemDetail}>Account Number: {item.accnumber}</Text>
      <Text style={styles.reportItemDetail}>Name: {item.name}</Text>
      <Text style={styles.reportItemDetail}>Amount: ฿{item.amount}</Text>
      <Text style={styles.reportItemDetail}>Reported By: {userNames[item.reporter] || 'Unknown'}</Text>
      <Text style={styles.reportItemDetail}>Date: {new Date(item.reportedAt).toLocaleString()}</Text>
    </View>
  );

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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>
      <View style={styles.section}>
        <TouchableOpacity style={styles.button} onPress={() => setShowPinModal(true)}>
          <Text style={styles.buttonText}>Set PIN</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => setShowChangePinModal(true)}>
          <Text style={styles.buttonText}>Change PIN</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => setShowReportFraudModal(true)}>
          <Text style={styles.buttonText}>Report Fraud</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleViewReportHistory}>
          <Text style={styles.buttonText}>Report History</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, { backgroundColor: '#DC2626' }]} onPress={handleLogout}>
          <Text style={[styles.buttonText, { color: 'white' }]}>Logout</Text>
        </TouchableOpacity>
      </View>
      {/* Set PIN Modal */}
      <Modal visible={showPinModal} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Set New PIN</Text>
            <TextInput
              style={styles.pinInput}
              placeholder="Enter new 6-digit PIN"
              value={newPin}
              onChangeText={setNewPin}
              keyboardType="numeric"
              maxLength={6}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.saveButton} onPress={handleAddPin}>
                <Text style={styles.saveButtonText}>Save PIN</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowPinModal(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* Change PIN Modal */}
      <Modal visible={showChangePinModal} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change PIN</Text>
            <TextInput
              style={styles.pinInput}
              placeholder="Enter old 6-digit PIN"
              value={oldPin}
              onChangeText={setOldPin}
              keyboardType="numeric"
              maxLength={6}
              secureTextEntry
            />
            <TextInput
              style={styles.pinInput}
              placeholder="Enter new 6-digit PIN"
              value={newPin}
              onChangeText={setNewPin}
              keyboardType="numeric"
              maxLength={6}
              secureTextEntry
            />
            <TextInput
              style={styles.pinInput}
              placeholder="Confirm new 6-digit PIN"
              value={confirmPin}
              onChangeText={setConfirmPin}
              keyboardType="numeric"
              maxLength={6}
              secureTextEntry
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.saveButton} onPress={handleChangePin}>
                <Text style={styles.saveButtonText}>Save New PIN</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowChangePinModal(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* Report Fraud Modal */}
      <Modal visible={showReportFraudModal} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowReportFraudModal(false)}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Report Fraud</Text>
            <TextInput
              style={styles.pinInput}
              placeholder="Fraud Account Number" 
              value={fraudAccNumber}
              onChangeText={setFraudAccNumber}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.pinInput}
              placeholder="Fraud Name" 
              value={fraudName}
              onChangeText={setFraudName}
            />
            <TextInput
              style={styles.pinInput}
              placeholder="Fraud Amount"
              value={fraudAmount}
              onChangeText={setFraudAmount}
              keyboardType="numeric"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.saveButton} onPress={handleSubmitFraudReport}>
                <Text style={styles.saveButtonText}>Submit Report</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* Report History Modal */}
      <Modal visible={showReportHistoryModal} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { width: '90%', maxWidth: 400, padding: 20 }]}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowReportHistoryModal(false)}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Fraud Report History</Text>
            {loading ? (
              <ActivityIndicator size="large" color="#1E40AF" style={{ marginVertical: 20 }} />
            ) : fraudReports.length === 0 ? (
              <Text style={styles.placeholderText}>No fraud reports yet.</Text>
            ) : (
              <FlatList
                data={fraudReports}
                keyExtractor={(_, index) => index.toString()}
                renderItem={renderReportItem}
                contentContainerStyle={{ paddingBottom: 20 }}
              />
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, fontSize: 16, color: '#6B7280' },
  section: { padding: 24 },
  sectionHeader: { 
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  button: { backgroundColor: '#FF0303', borderRadius: 8, padding: 18, marginBottom: 18, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: 'white', borderRadius: 16, padding: 24, width: '80%', maxWidth: 320 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1F2937', marginBottom: 24, textAlign: 'center' },
  pinInput: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 16, fontSize: 18, textAlign: 'center', marginBottom: 24, fontFamily: 'monospace' },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between' },
  saveButton: { backgroundColor: '#16A34A', borderRadius: 8, paddingHorizontal: 24, paddingVertical: 12, flex: 1, marginRight: 8 },
  saveButtonText: { color: 'white', fontSize: 16, fontWeight: '600', textAlign: 'center' },
  cancelButton: { backgroundColor: '#6B7280', borderRadius: 8, paddingHorizontal: 24, paddingVertical: 12, flex: 1, marginLeft: 8 },
  cancelButtonText: { color: 'white', fontSize: 16, fontWeight: '600', textAlign: 'center' },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  reportItem: {
    backgroundColor: '#FDF2F2',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
  },
  reportItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#DC2626',
    marginBottom: 5,
  },
  reportItemDetail: {
    fontSize: 14,
    color: '#333',
    marginBottom: 3,
  },
  placeholderText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default SettingsScreen;
