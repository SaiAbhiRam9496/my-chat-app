import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

const ADMIN_UID = 'ck89mcDZ7AQ4wL0TVMUHEetnM223';

export default function ChatListScreen({ navigation }) {
  const [chats, setChats] = useState([]);
  const currentUser = auth.currentUser;
  const isAdmin = currentUser?.uid === ADMIN_UID;

  useEffect(() => {
    const q = query(
      collection(db, 'chats'),
      where('members', 'array-contains', currentUser.uid),
      orderBy('updatedAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setChats(chatList);
    });
    return unsubscribe;
  }, []);

  const renderChat = ({ item }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() => navigation.navigate('Chat', { chatId: item.id, chatName: item.name })}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.name?.[0]?.toUpperCase()}</Text>
      </View>
      <View style={styles.chatInfo}>
        <Text style={styles.chatName}>{item.name}</Text>
        <Text style={styles.lastMessage}>{item.lastMessage || 'No messages yet'}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chats</Text>
        <View style={{ flexDirection: 'row', gap: 16 }}>
          {isAdmin && (
            <TouchableOpacity onPress={() => navigation.navigate('Admin')}>
              <Text style={styles.adminBtn}>Admin</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => navigation.navigate('NewChat')}>
            <Text style={styles.newChat}>+ New</Text>
          </TouchableOpacity>
        </View>
      </View>
      <FlatList
        data={chats}
        keyExtractor={item => item.id}
        renderItem={renderChat}
        ListEmptyComponent={
          <Text style={styles.empty}>No chats yet. Start one!</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: 52, borderBottomWidth: 0.5, borderBottomColor: '#eee' },
  headerTitle: { fontSize: 24, fontWeight: 'bold' },
  adminBtn: { fontSize: 16, color: '#ea4335', fontWeight: '600' },
  newChat: { fontSize: 16, color: '#4285F4', fontWeight: '600' },
  chatItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 0.5, borderBottomColor: '#eee' },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#4285F4', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  chatInfo: { flex: 1 },
  chatName: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  lastMessage: { fontSize: 14, color: '#666' },
  empty: { textAlign: 'center', marginTop: 60, color: '#999', fontSize: 16 },
});