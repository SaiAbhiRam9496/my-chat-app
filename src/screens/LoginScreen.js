import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async () => {
  if (!email || !password) return Alert.alert('Error', 'Fill in all fields');
  try {
    if (isSignUp) {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const user = result.user;
      console.log('Auth success, UID:', user.uid);
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      console.log('Doc exists:', userSnap.exists());
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          name: user.email.split('@')[0],
          photo: null,
          status: 'pending',
          createdAt: new Date(),
        });
        console.log('User doc written successfully');
      }
    } else {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const user = result.user;
      console.log('Signed in, UID:', user.uid);
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      console.log('Doc exists on signin:', userSnap.exists());
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          name: user.email.split('@')[0],
          photo: null,
          status: 'pending',
          createdAt: new Date(),
        });
        console.log('User doc created on signin');
      }
    }
  } catch (error) {
    console.log('Error:', error.code, error.message);
    Alert.alert('Error', error.message);
  }
};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Harsh App</Text>
      <Text style={styles.subtitle}>Chat with your people</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleAuth}>
        <Text style={styles.buttonText}>{isSignUp ? 'Sign Up' : 'Sign In'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
        <Text style={styles.toggle}>
          {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', padding: 24 },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 48 },
  input: { width: '100%', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 14, marginBottom: 12, fontSize: 16 },
  button: { backgroundColor: '#4285F4', width: '100%', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  toggle: { marginTop: 16, color: '#4285F4', fontSize: 14 },
});