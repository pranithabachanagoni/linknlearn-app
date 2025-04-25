// ✅ Modified ChatVS to use Firebase Realtime Database instead of Firestore
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, FlatList, TextInput, Modal,
  StyleSheet, Image, KeyboardAvoidingView, Platform, Alert
} from 'react-native';
import { Ionicons, Entypo } from '@expo/vector-icons';
import { ref as dbRef, onValue, push } from 'firebase/database';
import { database } from '../config/firebase';

const ChatVS = ({ navigation, route }: any) => {
  const { currentUserId, otherUser } = route.params;
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [showActions, setShowActions] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const getSortedChatId = () => {
    const sortedIds = [currentUserId, otherUser.id].sort();
    return `${sortedIds[0]}_${sortedIds[1]}`;
  };

  useEffect(() => {
    const chatId = getSortedChatId();
    const messagesRef = dbRef(database, `messages/${chatId}`);

    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val() || {};
      const loadedMessages = Object.entries(data).map(([id, msg]: any) => ({ id, ...msg }));
      setMessages(loadedMessages);

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    return () => unsubscribe();
  }, [currentUserId, otherUser.id]);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const chatId = getSortedChatId();
    const messagesRef = dbRef(database, `messages/${chatId}`);

    const newMessage = {
      text: inputText,
      senderId: currentUserId,
      createdAt: Date.now(),
    };

    try {
      await push(messagesRef, newMessage);
      setInputText('');
    } catch (err) {
      console.error("❌ Failed to send message:", err);
      Alert.alert("Error", "Message failed to send.");
    }
  };

  const renderItem = ({ item }: any) => {
    const isMe = item.senderId === currentUserId;
    return (
      <View
        style={[
          styles.messageBubble,
          isMe ? styles.messageRight : styles.messageLeft,
        ]}
      >
        <Text style={isMe ? styles.textWhite : styles.textBlack}>{item.text}</Text>
        <Text style={styles.seenText}>{new Date(item.createdAt).toLocaleTimeString()}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Image source={{ uri: otherUser.photoURL || 'https://i.pravatar.cc/300' }} style={styles.avatar} />
        <Text style={styles.username}>{otherUser.fullName || 'User'}</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity>
            <Ionicons name="call" size={22} color="black" style={styles.icon} />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="videocam" size={22} color="black" style={styles.icon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowActions(true)}>
            <Entypo name="dots-three-vertical" size={18} color="black" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 10 }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <View style={styles.inputContainer}>
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message"
            style={styles.input}
          />
          <TouchableOpacity onPress={sendMessage}>
            <Ionicons name="send" size={24} color="black" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <Modal
        visible={showActions}
        animationType="slide"
        transparent
        onRequestClose={() => setShowActions(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            {['Audio Call', 'Video Call', 'Block', 'Report', 'Delete Chat'].map((label, index) => (
              <TouchableOpacity key={index} style={styles.modalItem}>
                <Ionicons name={label.includes('Call') ? 'call' : 'alert'} size={22} color="black" />
                <Text style={styles.modalText}>{label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => setShowActions(false)} style={styles.modalCancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ChatVS;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row', alignItems: 'center', padding: 10,
    borderBottomColor: '#ccc', borderBottomWidth: 1,
  },
  avatar: { width: 35, height: 35, borderRadius: 999, marginHorizontal: 10 },
  username: { fontSize: 16, fontWeight: '600', flex: 1 },
  headerIcons: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: { marginHorizontal: 5 },
  messageBubble: { maxWidth: '75%', padding: 10, marginVertical: 4, borderRadius: 10 },
  messageLeft: { backgroundColor: '#f0f0f0', alignSelf: 'flex-start' },
  messageRight: { backgroundColor: '#000', alignSelf: 'flex-end' },
  textBlack: { color: '#000' },
  textWhite: { color: '#fff' },
  seenText: { fontSize: 10, color: '#ccc', marginTop: 4, alignSelf: 'flex-end' },
  inputContainer: {
    flexDirection: 'row', padding: 10,
    borderTopColor: '#ccc', borderTopWidth: 1, alignItems: 'center',
  },
  input: {
    flex: 1, backgroundColor: '#f0f0f0', borderRadius: 20,
    paddingHorizontal: 15, paddingVertical: 8, marginRight: 10,
  },
  modalOverlay: {
    flex: 1, backgroundColor: '#00000077', justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#fff', paddingVertical: 20,
    borderTopLeftRadius: 16, borderTopRightRadius: 16,
  },
  modalItem: {
    flexDirection: 'row', alignItems: 'center',
    padding: 15, paddingLeft: 20,
  },
  modalText: { fontSize: 16, marginLeft: 15 },
  modalCancel: { padding: 15, alignItems: 'center' },
  cancelText: { color: 'red', fontSize: 16 },
});
