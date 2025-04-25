import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TextInput, Image,
  TouchableOpacity, StyleSheet
} from 'react-native';
import { firestore } from '../config/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

export default function ChatListScreen({ navigation }) {
  const { user } = useAuth();
  const [connections, setConnections] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const userDoc = await getDoc(doc(firestore, 'users', user.uid));
        const userData = userDoc.data();
        const connectionIds = userData?.connections || [];

        const connectionDocs = await Promise.all(
          connectionIds.map((id) => getDoc(doc(firestore, 'users', id)))
        );

        const connectionData = connectionDocs
          .filter((doc) => doc.exists())
          .map((doc) => ({ id: doc.id, ...doc.data() }));

        setConnections(connectionData);
      } catch (error) {
        console.error('🔥 Error fetching connections:', error);
      }
    };

    fetchConnections();
  }, []);

  const filteredConnections = connections.filter((c) =>
    c.fullName.toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={async () => {
        const participants = [user.uid, item.id].sort();
        const chatId = `${participants[0]}_${participants[1]}`;

        const chatRef = doc(firestore, 'chats', chatId);
        const chatSnap = await getDoc(chatRef);

        if (!chatSnap.exists()) {
          await setDoc(chatRef, {
            participants,
            lastUpdated: serverTimestamp(),
          });
        }

        navigation.navigate('ChatVS', {
          chatId,
          currentUserId: user.uid,
          otherUser: item,
        });
      }}
    >
      <Image source={{ uri: item.photoURL || 'https://i.pravatar.cc/300' }} style={styles.avatar} />
      <View style={styles.textContainer}>
        <Text style={styles.name}>{item.fullName}</Text>
        <Text style={styles.message}>Tap to start chatting</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Search your messages..."
        style={styles.search}
        value={search}
        onChangeText={setSearch}
      />
      <FlatList
        data={filteredConnections}
        keyExtractor={(item) => item.id}
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
