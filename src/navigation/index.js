import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import LoginScreen from '../screens/LoginScreen';
import PendingScreen from '../screens/PendingScreen';
import RejectedScreen from '../screens/RejectedScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ChatListScreen from '../screens/ChatListScreen';
import ChatScreen from '../screens/ChatScreen';
import NewChatScreen from '../screens/NewChatScreen';
import AdminScreen from '../screens/AdminScreen';

const Stack = createNativeStackNavigator();
export const ADMIN_UID = 'ck89mcDZ7AQ4wL0TVMUHEetnM223';

export default function Navigation() {
  const [user, setUser] = useState(null);
  const [access, setAccess] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const userRef = doc(db, 'users', firebaseUser.uid);
        onSnapshot(userRef, (snap) => {
          if (snap.exists()) {
            setAccess(snap.data().access);
          }
          setLoading(false);
        });
      } else {
        setUser(null);
        setAccess(null);
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  if (loading) return null;

  const isAdmin = user?.uid === ADMIN_UID;
  const mainAppStatus = access?.mainApp;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : isAdmin || mainAppStatus === 'approved' ? (
          <>
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="ChatList" component={ChatListScreen} />
            <Stack.Screen name="Chat" component={ChatScreen} />
            <Stack.Screen name="NewChat" component={NewChatScreen} />
            {isAdmin && <Stack.Screen name="Admin" component={AdminScreen} />}
          </>
        ) : mainAppStatus === 'rejected' ? (
          <Stack.Screen name="Rejected" component={RejectedScreen} />
        ) : (
          <Stack.Screen name="Pending" component={PendingScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}