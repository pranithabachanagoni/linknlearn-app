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
    const searchTerm = queryText.trim().toLowerCase();
    if (!searchTerm) return;

    try {
      const snapshot = await getDocs(collection(firestore, 'users'));
      const users = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((u) => {
          if (u.id === user.uid) return false;
          const fullName = u.fullName?.toLowerCase() || '';
          const email = u.email?.toLowerCase() || '';
          const department = u.department?.toLowerCase() || '';
          const gradYear = String(u.graduationYear || '');

          return (
            fullName.includes(searchTerm) ||
            email.includes(searchTerm) ||
            department.includes(searchTerm) ||
            gradYear.includes(searchTerm)
          );
        });

      setResults(users);
    } catch (error) {
      console.error('Error searching users:', error);
      alert('Failed to search users.');
    }
  };

  const handleSendRequest = async (toUser) => {
    try {
      const userDocSnap = await getDocs(
        query(collection(firestore, 'users'), where('uid', '==', user.uid))
      );

      let fullName = user.fullName || 'Unknown';
      let photoURL = user.photoURL || '';

      userDocSnap.forEach((doc) => {
        const data = doc.data();
        if (data.fullName) fullName = data.fullName;
        if (data.photoURL) photoURL = data.photoURL;
      });

      const fromUser = {
        uid: user.uid,
        fullName,
        photoURL,
      };

      console.log("👤 Authenticated UID:", user?.uid);
      console.log("📦 From User Object:", fromUser);
      console.log("📦 To User Object:", toUser);
      
      const success = await sendLinkRequest(fromUser, toUser);
      
      if (success) alert('✅ Request Sent!');
      else alert('⚠️ Request already exists.');
    } catch (error) {
      console.error('Failed to send link request:', error);
      alert('❌ Failed to send request.');
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
