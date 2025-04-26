import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { firestore } from '../config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { uploadToImgur } from '../utils/imgurUpload'; // ✅ your Imgur uploader (we already have it)

export default function ReportIssueScreen({ navigation }: any) {
  const { user } = useAuth();
  const [image, setImage] = useState<any>(null);
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets.length > 0) {
      setImage(result.assets[0]);
    }
  };

  const handleSubmit = async () => {
    if (!description.trim() && !image) {
      Alert.alert('⚠️ Please add description or image.');
      return;
    }

    try {
      setUploading(true);

      let imageUrl = '';
      if (image) {
        const base64 = await uriToBase64(image.uri);
        imageUrl = await uploadToImgur(base64);
      }

      await addDoc(collection(firestore, 'reports'), {
        userId: user.uid,
        description: description.trim(),
        imageUrl,
        createdAt: serverTimestamp(),
      });

      Alert.alert('✅ Report Submitted!', 'Thanks for your feedback.');
      setDescription('');
      setImage(null);
      navigation.goBack();
    } catch (err) {
      console.error('Report submit error:', err);
      Alert.alert('❌ Error', 'Failed to submit report.');
    } finally {
      setUploading(false);
    }
  };

  const uriToBase64 = async (uri: string) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const reader = new FileReader();
    return new Promise<string>((resolve, reject) => {
      reader.onerror = reject;
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.readAsDataURL(blob);
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Report an Issue</Text>
      </View>

      <Text style={styles.subtitle}>Please provide screenshots if available.</Text>

      <TouchableOpacity style={styles.imageUploader} onPress={handlePickImage}>
        {image ? (
          <Image source={{ uri: image.uri }} style={styles.previewImage} />
        ) : (
          <Text style={styles.imageText}>Upload Image</Text>
        )}
      </TouchableOpacity>

      <TextInput
        placeholder="Describe the issue"
        placeholderTextColor="#999"
        style={styles.input}
        multiline
        value={description}
        onChangeText={setDescription}
      />

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={uploading}>
        {uploading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Submit</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backButton: { fontSize: 24, marginRight: 10 },
  title: { fontSize: 20, fontWeight: 'bold', flex: 1 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 10 },
  imageUploader: {
    height: 180, backgroundColor: '#f0f0f0', justifyContent: 'center',
    alignItems: 'center', borderRadius: 10, marginBottom: 20, borderWidth: 1, borderColor: '#ccc'
  },
  previewImage: { width: '100%', height: '100%', borderRadius: 10 },
  imageText: { color: '#777' },
  input: {
    height: 120, backgroundColor: '#f9f9f9', borderRadius: 10,
    padding: 12, textAlignVertical: 'top', borderWidth: 1, borderColor: '#ddd', marginBottom: 20,
  },
  submitButton: {
    backgroundColor: '#000', padding: 16, borderRadius: 10, alignItems: 'center',
  },
  submitText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
