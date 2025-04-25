import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '../../config/firebase';
import { useNavigation } from '@react-navigation/native';

const UserProfileView = ({ route }) => {
  const { userId } = route.params;
  const navigation = useNavigation();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      const userDoc = await getDoc(doc(firestore, 'users', userId));
      if (userDoc.exists()) setUserData(userDoc.data());
    };

    if (userId) loadProfile();
  }, [userId]);

  if (!userData) return <ActivityIndicator style={{ marginTop: 50 }} />;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Optional back button */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      {/* Avatar */}
      <Image
        source={{ uri: userData.photoURL || 'https://i.pravatar.cc/150' }}
        style={styles.avatar}
      />

      {/* Name & Department */}
      <Text style={styles.name}>{userData.fullName}</Text>
      <Text style={styles.sub}>{userData.department}</Text>

      {/* Additional fields */}
      <View style={styles.infoBox}>
        {userData.collegeName && (
          <Text style={styles.infoText}>
            🎓 College: <Text style={styles.infoValue}>{userData.collegeName}</Text>
          </Text>
        )}
        {userData.graduationYear && (
          <Text style={styles.infoText}>
            🗓️ Graduation Year: <Text style={styles.infoValue}>{userData.graduationYear}</Text>
          </Text>
        )}
        {userData.bio && (
          <Text style={styles.infoText}>
            🧠 Bio: <Text style={styles.infoValue}>{userData.bio}</Text>
          </Text>
        )}
        {userData.achievements && (
          <Text style={styles.infoText}>
            🏆 Achievements: <Text style={styles.infoValue}>{userData.achievements}</Text>
          </Text>
        )}
      </View>
    </ScrollView>
  );
};

export default UserProfileView;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  backBtn: {
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  backText: {
    fontSize: 16,
    color: '#007bff',
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    marginBottom: 16,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111',
  },
  sub: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  infoBox: {
    marginTop: 10,
    width: '100%',
  },
  infoText: {
    fontSize: 15,
    marginVertical: 6,
    color: '#333',
  },
  infoValue: {
    fontWeight: '500',
    color: '#000',
  },
});
