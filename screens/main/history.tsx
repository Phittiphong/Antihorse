import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, FlatList, ActivityIndicator } from 'react-native';
import { auth, database } from '../../firebase';

interface Transaction {
  id: string;
  from: string;
  to: string;
  amount: number;
  fee: number;
  note: string;
  status: string;
  timestamp: string;
}

interface UserInfo {
  accid: string;
  accnumber: string;
  name: string;
}

interface HistoryScreenProps {
  onBackToDeposit: () => void;
  onRepeatTransaction?: (tx: Transaction & { fromInfo: UserInfo; toInfo: UserInfo }) => void;
}

const HistoryScreen: React.FC<HistoryScreenProps> = ({ onBackToDeposit, onRepeatTransaction }) => {
  const [transactions, setTransactions] = useState<(Transaction & { fromInfo?: UserInfo; toInfo?: UserInfo })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const user = auth().currentUser;
        if (!user) {
          setTransactions([]);
          setLoading(false);
          return;
        }
        const [txSnap, usersSnap] = await Promise.all([
          database().ref('/transactions').once('value'),
          database().ref('/users').once('value'),
        ]);
        const txData = txSnap.val() || {};
        const usersData = usersSnap.val() || {};
        // แปลง object เป็น array
        const txList: (Transaction & { fromInfo?: UserInfo; toInfo?: UserInfo })[] = Object.values(txData)
          .filter((tx: any) => tx.from === user.uid || tx.to === user.uid)
          .map((tx: any) => ({
            ...tx,
            fromInfo: usersData[tx.from]
              ? { accid: usersData[tx.from].accid, accnumber: usersData[tx.from].accnumber, name: usersData[tx.from].name }
              : { accid: tx.from, accnumber: '-', name: '-' },
            toInfo: usersData[tx.to]
              ? { accid: usersData[tx.to].accid, accnumber: usersData[tx.to].accnumber, name: usersData[tx.to].name }
              : { accid: tx.to, accnumber: '-', name: '-' },
          }))
          .sort((a: any, b: any) => (b.timestamp || '').localeCompare(a.timestamp || ''));
        setTransactions(txList);
      } catch (e) {
        setTransactions([]);
      }
      setLoading(false);
    };
    fetchTransactions();
  }, []);

  const renderItem = ({ item }: { item: Transaction & { fromInfo?: UserInfo; toInfo?: UserInfo } }) => (
    <View style={styles.txItem}>
      <Text style={styles.txType}>
        {item.from === auth().currentUser?.uid ? 'Sent' : 'Received'}
      </Text>
      <Text style={styles.txAmount}>
        {item.from === auth().currentUser?.uid ? '-' : '+'}
        {item.amount} ฿
      </Text>
      {item.note ? <Text style={styles.txNote}>{item.note}</Text> : null}
      <Text style={styles.txDate}>{new Date(item.timestamp).toLocaleString()}</Text>
      <Text style={styles.txStatus}>{item.status}</Text>
      <View style={styles.txInfoRow}>
        <View style={styles.txInfoCol}>
          <Text style={styles.txInfoLabel}>From</Text>
          <Text style={styles.txInfoValue}>{item.fromInfo?.name || '-'}</Text>
          <Text style={styles.txInfoValue}>{item.fromInfo?.accnumber || '-'}</Text>
        </View>
        <View style={styles.txInfoCol}>
          <Text style={styles.txInfoLabel}>To</Text>
          <Text style={styles.txInfoValue}>{item.toInfo?.name || '-'}</Text>
          <Text style={styles.txInfoValue}>{item.toInfo?.accnumber || '-'}</Text>
        </View>
      </View>
      {onRepeatTransaction && (
        <TouchableOpacity
          style={styles.repeatButton}
          onPress={() => onRepeatTransaction({ ...item, fromInfo: item.fromInfo!, toInfo: item.toInfo! })}
        >
          <Text style={styles.repeatButtonText}>Repeat Transaction</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBackToDeposit} style={styles.backButton}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Transaction History</Text>
      </View>
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color="#1E40AF" />
        ) : transactions.length === 0 ? (
          <Text style={styles.placeholder}>No transaction history yet.</Text>
        ) : (
          <FlatList
            data={transactions}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 32 }}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#fff', elevation: 2 },
  backButton: { marginRight: 16 },
  backText: { fontSize: 18, color: '#1E40AF' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#1E40AF' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  placeholder: { fontSize: 16, color: '#6B7280' },
  txItem: { backgroundColor: '#fff', marginVertical: 8, padding: 16, borderRadius: 8, width: 340, elevation: 1 },
  txType: { fontWeight: 'bold', color: '#1E40AF' },
  txAmount: { fontSize: 18, fontWeight: 'bold', marginVertical: 4 },
  txNote: { color: '#6B7280' },
  txDate: { fontSize: 12, color: '#9CA3AF', marginTop: 4 },
  txStatus: { fontSize: 12, color: '#16A34A', marginTop: 2 },
  txInfoRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  txInfoCol: { flex: 1 },
  txInfoLabel: { fontSize: 12, color: '#6B7280', fontWeight: 'bold' },
  txInfoValue: { fontSize: 14, color: '#1F2937' },
  repeatButton: { marginTop: 12, backgroundColor: '#1E40AF', borderRadius: 8, paddingVertical: 8 },
  repeatButtonText: { color: 'white', fontWeight: 'bold', textAlign: 'center', fontSize: 16 },
});

export default HistoryScreen;
