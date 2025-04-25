import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, Image, StyleSheet, TouchableOpacity
} from 'react-native';
import {
  collection, query, where, getDocs, doc, getDoc
} from 'firebase/firestore';
import { firestore } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
interface User {
  id: string;
  fullName: string;
  department?: string;
  photoURL?: string;
}

const Links = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [connections, setConnections] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConnections = async () => {
    if (!user?.uid) return;

    const linkRequestsRef = collection(firestore, 'linkRequests');

    const qFrom = query(linkRequestsRef,
      where('status', '==', 'accepted'),
      where('from', '==', user.uid)
    );

    const qTo = query(linkRequestsRef,
      where('status', '==', 'accepted'),
      where('to', '==', user.uid)
    );

    const [fromSnap, toSnap] = await Promise.all([getDocs(qFrom), getDocs(qTo)]);

    const otherUserIds = new Set<string>();

    fromSnap.forEach(doc => otherUserIds.add(doc.data().to));
    toSnap.forEach(doc => otherUserIds.add(doc.data().from));

    const users: User[] = [];

    for (const uid of otherUserIds) {
      const userRef = doc(firestore, 'users', uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        users.push({ id: uid, ...userSnap.data() } as User);
      }
    }

    setConnections(users);
    setLoading(false);
  };

  useEffect(() => {
    if (user) fetchConnections();
  }, [user]);

  const handleChat = (otherUser: User) => {
    const sortedIds = [user.uid, otherUser.id].sort();
    const chatId = `${sortedIds[0]}_${sortedIds[1]}`;
    navigation.navigate('Chats', {
      screen: 'ChatVS',
      params: {
        chatId,
        currentUserId: user.uid,
        otherUser,
      },
    });
  };
  

  return (
    <View style={styles.container}>
      {loading ? (
        <Text style={styles.message}>Loading...</Text>
      ) : connections.length === 0 ? (
        <Text style={styles.message}>No connections yet.</Text>
      ) : (
        <FlatList
          data={connections}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <TouchableOpacity
                style={styles.userInfo}
                onPress={() => navigation.navigate('UserProfileView', { userId: item.id })}
              >
                <Image
                  source={{ uri: item.photoURL || 'https://i.pravatar.cc/150' }}
                  style={styles.avatar}
                />
                <View>
                  <Text style={styles.name}>{item.fullName}</Text>
                  <Text style={styles.sub}>{item.department || 'Unknown Dept'}</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => handleChat(item)}>
                <Ionicons name="chatbubble-ellipses-outline" size={22} color="#333" />
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
};

export default Links;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  message: { textAlign: 'center', marginTop: 50, color: '#666' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 1,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: { width: 48, height: 48, borderRadius: 24, marginRight: 12 },
  name: { fontSize: 16, fontWeight: '600' },
  sub: { fontSize: 13, color: '#666' },
});
