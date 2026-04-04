import { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

export default function ChatScreen({ route }) {
  const { chatId, chatName } = route.params;
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const currentUser = auth.currentUser;
  const flatListRef = useRef(null);

  useEffect(() => {
    const q = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('createdAt', 'asc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
    });
    return unsubscribe;
  }, [chatId]);

  const sendMessage = async () => {
    if (!text.trim()) return;
    const msgText = text.trim();
    setText('');
    await addDoc(collection(db, 'chats', chatId, 'messages'), {
      text: msgText,
      senderId: currentUser.uid,
      senderEmail: currentUser.email,
      createdAt: serverTimestamp(),
    });
    await updateDoc(doc(db, 'chats', chatId), {
      lastMessage: msgText,
      updatedAt: serverTimestamp(),
    });
  };

  const renderMessage = ({ item }) => {
    const isMe = item.senderId === currentUser.uid;
    return (
      <View style={[styles.messageBubble, isMe ? styles.myMessage : styles.theirMessage]}>
        {!isMe && <Text style={styles.senderName}>{item.senderEmail?.split('@')[0]}</Text>}
        <Text style={[styles.messageText, isMe && styles.myMessageText]}>{item.text}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{chatName}</Text>
      </View>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderMessage}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        contentContainerStyle={{ padding: 16 }}
      />
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Type a message..."
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { padding: 16, paddingTop: 52, borderBottomWidth: 0.5, borderBottomColor: '#eee' },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  messageBubble: { maxWidth: '75%', padding: 12, borderRadius: 16, marginBottom: 8 },
  myMessage: { alignSelf: 'flex-end', backgroundColor: '#4285F4' },
  theirMessage: { alignSelf: 'flex-start', backgroundColor: '#f1f1f1' },
  messageText: { fontSize: 15, color: '#000' },
  myMessageText: { color: '#fff' },
  senderName: { fontSize: 12, color: '#999', marginBottom: 4 },
  inputRow: { flexDirection: 'row', padding: 12, borderTopWidth: 0.5, borderTopColor: '#eee', alignItems: 'flex-end' },
  input: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, fontSize: 15, maxHeight: 100 },
  sendButton: { marginLeft: 8, backgroundColor: '#4285F4', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20 },
  sendText: { color: '#fff', fontWeight: '600' },
});