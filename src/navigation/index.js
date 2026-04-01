import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

import LoginScreen from '../screens/LoginScreen';
import PendingScreen from '../screens/PendingScreen';
import ChatListScreen from '../screens/ChatListScreen.js';

const Stack = createNativeStackNavigator();

export default function Navigation() {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const userRef = doc(db, 'users', firebaseUser.uid);
        onSnapshot(userRef, (snap) => {
          if (snap.exists()) setStatus(snap.data().status);
        });
      } else {
        setUser(null);
        setStatus(null);
      }
    });
    return unsubscribe;
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : status === 'approved' ? (
          <Stack.Screen name="ChatList" component={ChatListScreen} />
        ) : (
          <Stack.Screen name="Pending" component={PendingScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}