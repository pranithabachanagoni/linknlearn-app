import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { collection, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { firestore } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';

const SentRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(firestore, 'linkRequests'),
      where('from', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setRequests(data);
    });

    return () => unsubscribe();
  }, [user]);

  const handleCancel = async (requestId: string) => {
    try {
      await deleteDoc(doc(firestore, 'linkRequests', requestId));
    } catch (error) {
      console.error('Error cancelling request:', error);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image
        source={{ uri: item.toAvatar || 'https://i.pravatar.cc/150' }}
        style={styles.avatar}
      />
      <View style={styles.info}>
        <Text style={styles.name}>{item.toName || 'Unknown User'}</Text>
        <Text style={styles.status}>
          Status: <Text style={styles[item.status]}>{item.status}</Text>
        </Text>
      </View>
      {item.status === 'pending' && (
        <TouchableOpacity onPress={() => handleCancel(item.id)} style={styles.cancelBtn}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <FlatList
      data={requests}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      ListEmptyComponent={<Text style={styles.empty}>No sent requests</Text>}
    />
  );
};

export default SentRequests;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 10,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  info: { flex: 1 },
  name: { fontWeight: '600', fontSize: 15 },
  status: { fontSize: 13, color: '#555' },
  cancelBtn: {
    backgroundColor: '#ffecec',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  cancelText: {
    color: '#d00',
    fontWeight: '500',
  },
  accepted: { color: 'green' },
  rejected: { color: 'red' },
  pending: { color: '#888' },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    color: '#666',
  },
});
