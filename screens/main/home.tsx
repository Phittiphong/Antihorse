import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';

const mockData = {
  day: [100, 200, 150, 300, 250, 400, 350],
  month: [1200, 1500, 1100, 1800, 1700, 2000, 2100, 1900, 2200, 2300, 2100, 2500],
  year: [15000, 18000, 17000, 20000, 22000],
};
const mockLabels = {
  day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  year: ['2019', '2020', '2021', '2022', '2023'],
};

const HomeScreen = ({ onNavigateToHistory }: { onNavigateToHistory: () => void }) => {
  const [filter, setFilter] = useState<'day' | 'month' | 'year'>('day');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Welcome to AntiHorse</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.scanButton}>
            <Text style={styles.scanIcon}>📷</Text>
            <Text style={styles.buttonText}>Scan</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.qrButton}>
            <Text style={styles.qrIcon}>📱 QR</Text>
            <Text style={styles.buttonText}>MY QR</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.graphSection}>
          <Text style={styles.sectionTitle}>Money In-Out</Text>
          <View style={styles.filterRow}>
            <TouchableOpacity onPress={() => setFilter('day')} style={[styles.filterButton, filter==='day' && styles.filterActive]}><Text style={styles.filterText}>Day</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => setFilter('month')} style={[styles.filterButton, filter==='month' && styles.filterActive]}><Text style={styles.filterText}>Month</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => setFilter('year')} style={[styles.filterButton, filter==='year' && styles.filterActive]}><Text style={styles.filterText}>Year</Text></TouchableOpacity>
          </View>
          {/* กราฟ mock (bar chart) */}
          <View style={styles.graphBarContainer}>
            {mockData[filter].map((v, i) => (
              <View key={i} style={styles.graphBarItem}>
                <View style={[styles.graphBar, { height: v/10+20 }]} />
                <Text style={styles.graphLabel}>{mockLabels[filter][i]}</Text>
              </View>
            ))}
          </View>
        </View>
        <TouchableOpacity style={styles.historyButton} onPress={onNavigateToHistory}>
          <Text style={styles.historyButtonText}>View Transaction History</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#000000', marginBottom: 24, textAlign: 'center' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  scanButton: { flex: 1, backgroundColor: '#fff', borderRadius: 12, alignItems: 'center', padding: 20, marginRight: 8, elevation: 2 },
  qrButton: { flex: 1, backgroundColor: '#fff', borderRadius: 12, alignItems: 'center', padding: 20, marginLeft: 8, elevation: 2 },
  scanIcon: { fontSize: 32, marginBottom: 8 },
  qrIcon: { fontSize: 32, marginBottom: 8 },
  buttonText: { fontSize: 16, color: '#000000', fontWeight: 'bold' },
  graphSection: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 24, elevation: 2 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#000000', marginBottom: 12 },
  filterRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 12 },
  filterButton: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 8, backgroundColor: '#E5E7EB', marginHorizontal: 4 },
  filterActive: { backgroundColor: '#FF0303' },
  filterText: { color: '#fff', fontWeight: 'bold' },
  graphBarContainer: { flexDirection: 'row', alignItems: 'flex-end', height: 100, marginBottom: 8 },
  graphBarItem: { flex: 1, alignItems: 'center' },
  graphBar: { width: 18, backgroundColor: '#FF0303', borderRadius: 6, marginBottom: 4 },
  graphLabel: { fontSize: 12, color: '#6B7280' },
  historyButton: { backgroundColor: '#FF0303', borderRadius: 8, padding: 16, alignItems: 'center', marginTop: 16 },
  historyButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default HomeScreen;
