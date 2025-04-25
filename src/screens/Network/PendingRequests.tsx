
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { collection, query, where, onSnapshot, updateDoc, doc, arrayUnion } from 'firebase/firestore';
import { firestore } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

const PendingRequests = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    if (!user) return;
    const q = query(
        collection(firestore, 'linkRequests'),
        where('to', '==', user.uid),
        where('status', '==', 'pending')
      );
      

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setRequests(data);
    });

    return () => unsubscribe();
  }, [user]);

  const handleAction = async (requestId: string, status: 'accepted' | 'rejected', requestData) => {
    const ref = doc(firestore, 'linkRequests', requestId);
    await updateDoc(ref, { status });

    if (status === 'accepted') {
      const fromRef = doc(firestore, 'users', requestData.from);
      const toRef = doc(firestore, 'users', requestData.to);

      await updateDoc(fromRef, {
        connections: arrayUnion(requestData.to),
      });

      await updateDoc(toRef, {
        connections: arrayUnion(requestData.from),
      });
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.avatar || 'https://i.pravatar.cc/150' }} style={styles.avatar} />
      <TouchableOpacity
        onPress={() => navigation.navigate('UserProfileView', { userId: item.from })}
        style={styles.info}
      >
        <Text style={styles.name}>{item.fromName || 'Unknown'}</Text>
        <Text style={styles.role}>wants to connect</Text>
      </TouchableOpacity>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => handleAction(item.id, 'accepted', item)} style={styles.acceptBtn}>
          <Text style={styles.acceptText}>Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleAction(item.id, 'rejected', item)} style={styles.rejectBtn}>
          <Text style={styles.rejectText}>Reject</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <FlatList
      data={requests}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 30 }}>No pending requests</Text>}
    />
  );
};

export default PendingRequests;

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  avatar: { width: 48, height: 48, borderRadius: 24, marginRight: 12 },
  info: { flex: 1 },
  name: { fontWeight: '600', fontSize: 15 },
  role: { fontSize: 13, color: '#555' },
  actions: { flexDirection: 'row', gap: 10 },
  acceptBtn: { backgroundColor: '#d4fcd6', padding: 6, borderRadius: 8 },
  rejectBtn: { backgroundColor: '#fddddd', padding: 6, borderRadius: 8 },
  acceptText: { color: '#218c2e' },
  rejectText: { color: '#c92c2c' },
});
