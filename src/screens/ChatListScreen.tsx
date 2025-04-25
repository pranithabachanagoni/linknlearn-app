import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TextInput, Image,
  TouchableOpacity, StyleSheet
} from 'react-native';
import { ref as dbRef, onValue } from 'firebase/database';
import { database, firestore } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

export default function ChatListScreen({ navigation }) {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!user) return;

    const messagesRef = dbRef(database, 'messages');

    onValue(messagesRef, async (snapshot) => {
      const data = snapshot.val() || {};
      const relevantChats = Object.entries(data).filter(([chatId]) =>
        chatId.includes(user.uid)
      );

      const chatData = await Promise.all(
        relevantChats.map(async ([chatId, messages]) => {
          const messagesArray = Object.entries(messages).map(([id, msg]) => msg);
          const lastMsg = messagesArray[messagesArray.length - 1];

          const otherUserId = chatId.replace(user.uid, '').replace('_', '');
          const userDoc = await getDoc(doc(firestore, 'users', otherUserId));
          const otherUser = userDoc.exists() ? userDoc.data() : {};

          return {
            chatId,
            lastMessage: lastMsg.text,
            time: lastMsg.createdAt,
            otherUser: {
              id: otherUserId,
              fullName: otherUser.fullName || 'User',
              photoURL: otherUser.photoURL || 'https://i.pravatar.cc/300',
            },
          };
        })
      );

      setChats(chatData.sort((a, b) => b.time - a.time));
    });
  }, [user]);

  const filteredChats = chats.filter((chat) =>
    chat.otherUser.fullName.toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() =>
        navigation.navigate('ChatVS', {
          chatId: item.chatId,
          currentUserId: user.uid,
          otherUser: item.otherUser,
        })
      }
    >
      <Image source={{ uri: item.otherUser.photoURL }} style={styles.avatar} />
      <View style={styles.textContainer}>
        <Text style={styles.name}>{item.otherUser.fullName}</Text>
        <Text style={styles.message} numberOfLines={1}>
          {item.lastMessage}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Search chats..."
        style={styles.search}
        value={search}
        onChangeText={setSearch}
      />
      <FlatList
        data={filteredChats}
        keyExtractor={(item) => item.chatId}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 10 },
  search: {
    backgroundColor: '#f1f1f1',
    borderRadius: 10,
    margin: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 14,
  },
  itemContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: '#ddd',
  },
  avatar: { width: 46, height: 46, borderRadius: 23, marginRight: 12 },
  textContainer: { flex: 1 },
  name: { fontWeight: '600', fontSize: 16, marginBottom: 2 },
  message: { color: '#555', fontSize: 14 },
});
