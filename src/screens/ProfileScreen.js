import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase/config';

const ADMIN_UID = 'ck89mcDZ7AQ4wL0TVMUHEetnM223';

export default function ProfileScreen({ navigation }) {
  const currentUser = auth.currentUser;
  const isAdmin = currentUser?.uid === ADMIN_UID;
  const [userData, setUserData] = useState(null);
  const [name, setName] = useState('');
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const userRef = doc(db, 'users', currentUser.uid);
    const unsubscribe = onSnapshot(userRef, (snap) => {
      if (snap.exists()) {
        setUserData(snap.data());
        setName(snap.data().name || '');
      }
    });
    return unsubscribe;
  }, []);

  const saveName = async () => {
    if (!name.trim()) return Alert.alert('Error', 'Name cannot be empty');
    await updateDoc(doc(db, 'users', currentUser.uid), { name: name.trim() });
    setEditing(false);
    Alert.alert('Saved!', 'Your name has been updated.');
  };

  const handleChatApp = async () => {
  const status = userData?.access?.chatApp;
  if (status === 'approved') {
    navigation.navigate('ChatList');
  } else if (status === 'pending') {
    Alert.alert('Pending', 'Your Chatting App access is pending admin approval.');
  } else if (status === 'rejected') {
    Alert.alert(
      'Access Denied',
      'Your Chatting App access was rejected. Request again?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Request Again',
          onPress: async () => {
            await updateDoc(doc(db, 'users', currentUser.uid), {
              'access.chatApp': 'pending'
            });
            Alert.alert('Done', 'Request sent again!');
          }
        }
      ]
    );
  } else {
    Alert.alert(
      'Request Access',
      'Request access to Chatting App?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Request',
          onPress: async () => {
            await updateDoc(doc(db, 'users', currentUser.uid), {
              'access.chatApp': 'pending'
            });
            Alert.alert('Done', 'Request sent!');
          }
        }
      ]
    );
  }
  };

  const getAppStatusColor = (status) => {
    if (status === 'approved') return '#34a853';
    if (status === 'rejected') return '#ea4335';
    return '#f9a825';
  };

  const getAppStatusLabel = (status) => {
    if (status === 'approved') return 'Access Granted';
    if (status === 'rejected') return 'Access Denied';
    return 'Pending Approval';
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity onPress={() => signOut(auth)}>
          <Text style={styles.logout}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(userData?.name || currentUser?.email || 'U')[0].toUpperCase()}
          </Text>
        </View>
        {editing ? (
          <View style={styles.editRow}>
            <TextInput
              style={styles.nameInput}
              value={name}
              onChangeText={setName}
              autoFocus
            />
            <TouchableOpacity style={styles.saveBtn} onPress={saveName}>
              <Text style={styles.saveBtnText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setEditing(false)}>
              <Text style={styles.cancelBtn}>Cancel</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.nameRow}>
            <Text style={styles.userName}>{userData?.name}</Text>
            <TouchableOpacity onPress={() => setEditing(true)}>
              <Text style={styles.editBtn}>Edit</Text>
            </TouchableOpacity>
          </View>
        )}
        <Text style={styles.userEmail}>{currentUser?.email}</Text>
      </View>

      <Text style={styles.sectionTitle}>Apps</Text>

      <TouchableOpacity style={styles.appCard} onPress={handleChatApp}>
        <View>
          <Text style={styles.appName}>Chatting App</Text>
          <Text style={[styles.appStatus, { color: getAppStatusColor(userData?.access?.chatApp) }]}>
            {getAppStatusLabel(userData?.access?.chatApp)}
          </Text>
        </View>
        <Text style={styles.appArrow}>→</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.appCard, styles.appCardDisabled]}>
        <View>
          <Text style={styles.appName}>Music App</Text>
          <Text style={styles.appComingSoon}>Coming Soon</Text>
        </View>
        <Text style={styles.appArrow}>→</Text>
      </TouchableOpacity>

      {isAdmin && (
        <TouchableOpacity
          style={styles.adminCard}
          onPress={() => navigation.navigate('Admin')}>
          <Text style={styles.adminCardText}>Admin Panel</Text>
          <Text style={styles.appArrow}>→</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: 52, borderBottomWidth: 0.5, borderBottomColor: '#eee' },
  headerTitle: { fontSize: 24, fontWeight: 'bold' },
  logout: { fontSize: 15, color: '#999' },
  avatarSection: { alignItems: 'center', padding: 32, borderBottomWidth: 0.5, borderBottomColor: '#eee' },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#4285F4', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  avatarText: { color: '#fff', fontSize: 36, fontWeight: 'bold' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 6 },
  userName: { fontSize: 22, fontWeight: 'bold' },
  editBtn: { fontSize: 14, color: '#4285F4' },
  editRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  nameInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 8, fontSize: 18, minWidth: 160 },
  saveBtn: { backgroundColor: '#4285F4', padding: 8, borderRadius: 8 },
  saveBtnText: { color: '#fff', fontWeight: '600' },
  cancelBtn: { color: '#999', fontSize: 14 },
  userEmail: { fontSize: 15, color: '#666' },
  sectionTitle: { fontSize: 13, color: '#999', fontWeight: '600', padding: 16, paddingBottom: 8, letterSpacing: 1 },
  appCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', margin: 12, marginTop: 4, padding: 20, borderWidth: 0.5, borderColor: '#eee', borderRadius: 12 },
  appCardDisabled: { opacity: 0.5 },
  appName: { fontSize: 17, fontWeight: '600', marginBottom: 4 },
  appStatus: { fontSize: 13 },
  appComingSoon: { fontSize: 13, color: '#999' },
  appArrow: { fontSize: 20, color: '#ccc' },
  adminCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', margin: 12, marginTop: 4, padding: 20, backgroundColor: '#fff5f5', borderWidth: 0.5, borderColor: '#ea4335', borderRadius: 12 },
  adminCardText: { fontSize: 17, fontWeight: '600', color: '#ea4335' },
});