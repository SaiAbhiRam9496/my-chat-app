import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

export default function NewChatScreen({ navigation }) {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchUsers = async () => {
      const q = query(
        collection(db, 'users'),
        where('status', '==', 'approved')
      );
      const snapshot = await getDocs(q);
      const userList = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(u => u.uid !== currentUser.uid);
      setUsers(userList);
    };
    fetchUsers();
  }, []);

  const startChat = async (otherUser) => {
    try {
      const chatRef = await addDoc(collection(db, 'chats'), {
        name: otherUser.name || otherUser.email.split('@')[0],
        members: [currentUser.uid, otherUser.uid],
        lastMessage: '',
        updatedAt: serverTimestamp(),
        isGroup: false,
      });
      navigation.replace('Chat', { chatId: chatRef.id, chatName: otherUser.name || otherUser.email.split('@')[0] });
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const filtered = users.filter(u =>
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>New Chat</Text>
      </View>
      <TextInput
        style={styles.search}
        placeholder="Search by email..."
        value={search}
        onChangeText={setSearch}
      />
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.userItem} onPress={() => startChat(item)}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.email[0].toUpperCase()}</Text>
            </View>
            <Text style={styles.email}>{item.email}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No approved users found</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { padding: 16, paddingTop: 52, borderBottomWidth: 0.5, borderBottomColor: '#eee' },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  search: { margin: 12, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 15 },
  userItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 0.5, borderBottomColor: '#eee' },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#4285F4', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  email: { fontSize: 15 },
  empty: { textAlign: 'center', marginTop: 40, color: '#999' },
});