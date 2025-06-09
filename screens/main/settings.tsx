import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
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
});

export default SettingsScreen;
