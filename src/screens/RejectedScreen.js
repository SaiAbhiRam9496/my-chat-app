import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { signOut } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

export default function RejectedScreen() {
  const currentUser = auth.currentUser;

  const handleReRequest = async () => {
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        'access.mainApp': 'pending'
      });
      Alert.alert('Done', 'Request sent again. Waiting for approval.');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Access Denied</Text>
      <Text style={styles.subtitle}>Your request was rejected by the admin.</Text>
      <TouchableOpacity onPress={handleReRequest} style={styles.reRequestBtn}>
        <Text style={styles.reRequestText}>Request Access Again</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => signOut(auth)} style={styles.button}>
        <Text style={styles.buttonText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', padding: 32 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 12, color: '#ea4335' },
  subtitle: { fontSize: 16, color: '#666', textAlign: 'center', lineHeight: 24, marginBottom: 32 },
  reRequestBtn: { backgroundColor: '#4285F4', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8, marginBottom: 12, width: '100%', alignItems: 'center' },
  reRequestText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  button: { backgroundColor: '#ea4335', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8, width: '100%', alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600' },
});