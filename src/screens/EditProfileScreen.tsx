import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { firestore, storage } from '../config/firebase'; // Make sure `storage` is exported from firebase.ts

const EditProfileScreen = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const [profileData, setProfileData] = useState({
    fullName: '',
    department: '',
    collegeName: '',
    graduationYear: '',
    bio: '',
    achievements: '',
    photoURL: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      const docRef = doc(firestore, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProfileData((prev) => ({ ...prev, ...docSnap.data() }));
      }
    };
    fetchData();
  }, []);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert('Permission to access gallery is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.5,
    });

    if (!result.canceled && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      await uploadImage(uri);
    }
  };

  const uploadImage = async (uri: string) => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await fetch(uri);
      const blob = await response.blob();

      const storageRef = ref(storage, `profilePictures/${user.uid}.jpg`);
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);

      setProfileData((prev) => ({ ...prev, photoURL: downloadURL }));
      Alert.alert('Success', 'Image uploaded successfully!');
    } catch (error) {
      console.error('Image Upload Error:', error);
      Alert.alert('Upload failed', 'Unable to upload image.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const userRef = doc(firestore, 'users', user.uid);
      await setDoc(userRef, profileData, { merge: true });
      Alert.alert('Profile Updated', 'Your changes have been saved.');
    } catch (error) {
      console.error('Profile Save Error:', error);
      Alert.alert('Error', 'Failed to save profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={pickImage}>
        <Image
          source={{ uri: profileData.photoURL || 'https://i.pravatar.cc/300' }}
          style={styles.avatar}
        />
        <Text style={styles.changePhoto}>Tap to change photo</Text>
      </TouchableOpacity>

      {[
        { key: 'fullName', label: 'Full Name' },
        { key: 'department', label: 'Department' },
        { key: 'collegeName', label: 'College Name' },
        { key: 'graduationYear', label: 'Graduation Year' },
        { key: 'bio', label: 'Bio' },
        { key: 'achievements', label: 'Achievements' },
      ].map(({ key, label }) => (
        <TextInput
          key={key}
          style={styles.input}
          placeholder={label}
          value={(profileData as any)[key]}
          onChangeText={(text) => setProfileData({ ...profileData, [key]: text })}
        />
      ))}

      <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
        <Text style={styles.saveText}>{loading ? 'Saving...' : 'Save Profile'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignSelf: 'center',
  },
  changePhoto: {
    textAlign: 'center',
    marginVertical: 8,
    color: '#007bff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  saveButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  
});

export default EditProfileScreen;

