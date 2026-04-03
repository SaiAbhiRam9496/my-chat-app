import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/config';

export default function PendingScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Request Sent!</Text>
      <Text style={styles.subtitle}>Waiting for admin approval.{'\n'}You'll be unlocked shortly.</Text>
      <TouchableOpacity onPress={() => signOut(auth)} style={styles.button}>
        <Text style={styles.buttonText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', padding: 32 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
  subtitle: { fontSize: 16, color: '#666', textAlign: 'center', lineHeight: 24, marginBottom: 32 },
  button: { backgroundColor: '#ff4444', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  buttonText: { color: '#fff', fontSize: 14 },
});