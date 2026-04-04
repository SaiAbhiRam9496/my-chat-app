import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

export default function AdminScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('mainApp');
  const [pendingUsers, setPendingUsers] = useState([]);
  const [counts, setCounts] = useState({ mainApp: 0, chatApp: 0, musicApp: 0 });

  useEffect(() => {
    const unsubs = ['mainApp', 'chatApp', 'musicApp'].map(app => {
      const q = query(collection(db, 'users'), where(`access.${app}`, '==', 'pending'));
      return onSnapshot(q, (snap) => {
        setCounts(prev => ({ ...prev, [app]: snap.size }));
      });
    });
    return () => unsubs.forEach(u => u());
  }, []);

  useEffect(() => {
    const fieldPath = `access.${activeTab}`;
    const q = query(collection(db, 'users'), where(fieldPath, '==', 'pending'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPendingUsers(users);
    });
    return unsubscribe;
  }, [activeTab]);

  const handleApprove = async (uid) => {
    await updateDoc(doc(db, 'users', uid), {
      [`access.${activeTab}`]: 'approved'
    });
  };

  const handleReject = async (uid) => {
    await updateDoc(doc(db, 'users', uid), {
      [`access.${activeTab}`]: 'rejected'
    });
  };

  const tabs = [
    { key: 'mainApp', label: 'Main App' },
    { key: 'chatApp', label: 'Chat App' },
    { key: 'musicApp', label: 'Music App' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admin Panel</Text>
      </View>

      <View style={styles.tabs}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => setActiveTab(tab.key)}>
            <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
              {tab.label}
            </Text>
            {counts[tab.key] > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{counts[tab.key]}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={pendingUsers}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.userCard}>
            <View style={styles.userInfo}>
              <Text style={styles.email}>{item.email}</Text>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.date}>
                {item.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown'}
              </Text>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.approveBtn}
                onPress={() => handleApprove(item.uid)}>
                <Text style={styles.approveTxt}>Approve</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.rejectBtn}
                onPress={() => handleReject(item.uid)}>
                <Text style={styles.rejectTxt}>Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No pending requests</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 16, paddingTop: 52, borderBottomWidth: 0.5, borderBottomColor: '#eee' },
  back: { fontSize: 16, color: '#4285F4' },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  tabs: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: '#eee' },
  tab: { flex: 1, padding: 14, alignItems: 'center' },
  activeTab: { borderBottomWidth: 2, borderBottomColor: '#4285F4' },
  tabText: { fontSize: 14, color: '#999' },
  activeTabText: { color: '#4285F4', fontWeight: '600' },
  badge: { backgroundColor: '#ea4335', borderRadius: 10, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  userCard: { padding: 16, borderBottomWidth: 0.5, borderBottomColor: '#eee' },
  userInfo: { marginBottom: 12 },
  email: { fontSize: 16, fontWeight: '600' },
  name: { fontSize: 14, color: '#666', marginTop: 2 },
  date: { fontSize: 13, color: '#999', marginTop: 2 },
  actions: { flexDirection: 'row', gap: 12 },
  approveBtn: { flex: 1, backgroundColor: '#34a853', padding: 10, borderRadius: 8, alignItems: 'center' },
  approveTxt: { color: '#fff', fontWeight: '600' },
  rejectBtn: { flex: 1, backgroundColor: '#fff', padding: 10, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#ea4335' },
  rejectTxt: { color: '#ea4335', fontWeight: '600' },
  empty: { textAlign: 'center', marginTop: 60, color: '#999', fontSize: 16 },
});