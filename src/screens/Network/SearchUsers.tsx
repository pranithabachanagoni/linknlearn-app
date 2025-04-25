import React, { useState } from 'react';
import {
  View, TextInput, FlatList, Text, Image, TouchableOpacity, StyleSheet,
} from 'react-native';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { firestore } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import { sendLinkRequest } from '../../utils/sendLinkRequest';

const SearchUsers = () => {
  const { user } = useAuth();
  const [queryText, setQueryText] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    if (!queryText.trim()) return;

    const q = query(
      collection(firestore, 'users'),
      where('fullName', '>=', queryText),
      where('fullName', '<=', queryText + '\uf8ff')
    );

    const snapshot = await getDocs(q);
    const users = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((u) => u.id !== user.uid); // exclude current user

    setResults(users);
  };

  const handleSendRequest = async (toUser) => {
    try {
      // Fetch current user's full name from Firestore
      const userDoc = await getDocs(
        query(collection(firestore, 'users'), where('uid', '==', user.uid))
      );
  
      let fullName = 'Unknown';
      userDoc.forEach((doc) => {
        const data = doc.data();
        if (data.fullName) fullName = data.fullName;
      });
  
      const fromUser = {
        uid: user.uid,
        fullName, // ✅ properly fetched from Firestore
      };
  
      const success = await sendLinkRequest(fromUser, toUser);
      if (success) alert('Request Sent!');
    } catch (error) {
      console.error('Failed to send link request:', error);
      alert('Failed to send request.');
    }
  };
  

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Search by name"
        style={styles.search}
        value={queryText}
        onChangeText={setQueryText}
        onSubmitEditing={handleSearch}
      />
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.photoURL || 'https://i.pravatar.cc/150' }} style={styles.avatar} />
            <View style={styles.info}>
              <Text style={styles.name}>{item.fullName}</Text>
              <Text style={styles.sub}>{item.department}</Text>
            </View>
            <TouchableOpacity onPress={() => handleSendRequest(item)} style={styles.button}>
              <Text style={styles.buttonText}>Connect</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

export default SearchUsers;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  search: {
    backgroundColor: '#f1f1f1',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    fontSize: 14,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 10,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 10,
  },
  info: { flex: 1 },
  name: { fontWeight: '600', fontSize: 15 },
  sub: { fontSize: 12, color: '#666' },
  button: {
    backgroundColor: '#000',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  buttonText: { color: '#fff', fontWeight: '500' },
});
