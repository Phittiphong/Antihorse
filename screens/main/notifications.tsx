import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, ActivityIndicator } from 'react-native';
import firebase from '../../firebase';

const NotificationsScreen: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [userNames, setUserNames] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const user = firebase.auth().currentUser;
        if (!user) {
          setNotifications([]);
          setLoading(false);
          return;
        }
        setUserId(user.uid);

        const usersSnap = await firebase.database().ref('/users').once('value');
        const usersData = usersSnap.val() || {};
        const names: { [key: string]: string } = {};
        for (const uid in usersData) {
          names[uid] = usersData[uid].name || 'Unknown User';
        }
        setUserNames(names);

        const txSnap = await firebase.database().ref('/transactions').once('value');
        const txData = txSnap.val() || {};
        const txList = Object.values(txData)
          .filter((tx: any) => tx.from === user.uid || tx.to === user.uid)
          .sort((a: any, b: any) => (b.timestamp || '').localeCompare(a.timestamp || ''));
        setNotifications(txList);
      } catch (e) {
        setNotifications([]);
      }
      setLoading(false);
    };
    fetchNotifications();
  }, []);

  const renderItem = ({ item }: { item: any }) => {
    const isSent = item.from === userId;
    const isReceived = item.to === userId;
    let type = '';
    if (isSent && item.status === 'completed') type = 'Successfull Payment';
    else if (isReceived && item.status === 'completed') type = 'Incoming Transfer';
    else return null;
    return (
      <View style={styles.notificationItem}>
        <Text style={styles.type}>{type}</Text>
        <Text style={styles.amount}>{isSent ? '-' : '+'}{item.amount} ฿</Text>
        <Text style={styles.detail}>From: {userNames[item.from] || item.from}</Text>
        <Text style={styles.detail}>To: {userNames[item.to] || item.to}</Text>
        <Text style={styles.detail}>Date: {new Date(item.timestamp).toLocaleString()}</Text>
        <Text style={styles.status}>{item.status}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Notifications</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#1E40AF" style={{ marginTop: 32 }} />
      ) : notifications.length === 0 ? (
        <Text style={styles.placeholder}>No notifications yet.</Text>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(_, idx) => idx.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 32 }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { fontSize: 24, fontWeight: 'bold', color: '#1E40AF', textAlign: 'center', marginVertical: 24 },
  notificationItem: { backgroundColor: '#fff', marginVertical: 8, padding: 16, borderRadius: 8, width: 340, alignSelf: 'center', elevation: 1 },
  type: { fontWeight: 'bold', color: '#1E40AF', fontSize: 16 },
  amount: { fontSize: 18, fontWeight: 'bold', marginVertical: 4 },
  detail: { color: '#6B7280', fontSize: 13 },
  status: { fontSize: 12, color: '#16A34A', marginTop: 2 },
  placeholder: { fontSize: 16, color: '#6B7280', textAlign: 'center', marginTop: 32 },
});

export default NotificationsScreen;
