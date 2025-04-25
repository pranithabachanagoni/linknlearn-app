import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { ref as dbRef, onValue, push, update } from 'firebase/database';
import { database } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { uploadToImgur } from '../utils/imgurUpload';

export default function HomeScreen() {
  const { user } = useAuth();
  const [postText, setPostText] = useState('');
  const [posts, setPosts] = useState<any[]>([]);
  const [image, setImage] = useState<any>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user) return;

    const postsRef = dbRef(database, 'posts');
    onValue(postsRef, (snapshot) => {
      const data = snapshot.val() || {};
      const fetchedPosts = Object.entries(data)
        .map(([id, post]: any) => ({ id, ...post }))
        .sort((a, b) => b.createdAt - a.createdAt);
      setPosts(fetchedPosts);
    });
  }, [user]);

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

  const handlePost = async () => {
    if (!user || (!postText.trim() && !image)) return;

    try {
      setUploading(true);

      let imageUrl = '';
      if (image) {
        const base64 = image.base64;
        imageUrl = await uploadToImgur(base64);
      }

      const newPost = {
        authorId: user.uid,
        name: user.displayName || 'Anonymous',
        avatar: user.photoURL || 'https://i.pravatar.cc/150',
        content: postText.trim(),
        imageUrl,
        createdAt: Date.now(),
        likes: 0,
        comments: [],
        shares: 0,
      };

      await push(dbRef(database, 'posts'), newPost);

      setPostText('');
      setImage(null);
      Alert.alert('✅ Posted', 'Your post has been published!');
    } catch (err) {
      console.error('Post failed:', err);
      Alert.alert('Error', 'Failed to post. Try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleLike = async (postId: string, currentLikes: number) => {
    const postRef = dbRef(database, `posts/${postId}`);
    await update(postRef, { likes: currentLikes + 1 });
  };

  const renderPost = ({ item }: any) => (
    <View style={styles.postCard}>
      <View style={styles.userRow}>
        <Image source={{ uri: item.avatar || 'https://i.pravatar.cc/150' }} style={styles.avatar} />
        <View>
          <Text style={styles.userName}>{item.name || 'Anonymous'}</Text>
          <Text style={styles.postTime}>{new Date(item.createdAt).toLocaleString()}</Text>
        </View>
        <Ionicons name="ellipsis-vertical" size={18} color="#888" style={{ marginLeft: 'auto' }} />
      </View>

      {item.content && <Text style={styles.postContent}>{item.content}</Text>}

      {item.imageUrl && <Image source={{ uri: item.imageUrl }} style={styles.postImage} />}

      <View style={styles.reactions}>
        <TouchableOpacity onPress={() => handleLike(item.id, item.likes)}>
          <Text>❤️ {item.likes || 0}</Text>
        </TouchableOpacity>
        <Text>💬 {item.comments?.length || 0}</Text>
        <Text>↗️ {item.shares || 0}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <Image source={{ uri: user?.photoURL || 'https://i.pravatar.cc/150' }} style={styles.headerAvatar} />
        <Text style={styles.headerTitle}>Feed</Text>
        <Ionicons name="settings-outline" size={24} color="#000" />
      </View>

      <View style={styles.postComposer}>
        <Text style={styles.composerTitle}>Create Post</Text>
        <TextInput
          style={styles.input}
          placeholder="What's on your mind?"
          placeholderTextColor="#999"
          multiline
          value={postText}
          onChangeText={setPostText}
        />
        {image && <Image source={{ uri: image.uri }} style={styles.previewImage} />}
        <TouchableOpacity style={styles.imageButton} onPress={handlePickImage}>
          <Text style={{ color: '#000' }}>Add Image</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.postButton} onPress={handlePost} disabled={uploading}>
          <Text style={{ color: '#fff', fontWeight: '600' }}>
            {uploading ? 'Posting...' : 'Post'}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.recentText}>Recent Posts</Text>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { padding: 16, paddingTop: 10, flexDirection: 'row', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '700', flex: 1, textAlign: 'center', color: '#000' },
  headerAvatar: { width: 35, height: 35, borderRadius: 17.5 },
  postComposer: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  composerTitle: { fontSize: 16, fontWeight: '600', marginBottom: 6, color: '#000' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, fontSize: 14, color: '#000', marginBottom: 8 },
  imageButton: { backgroundColor: '#f2f2f2', padding: 12, alignItems: 'center', borderRadius: 6, marginBottom: 10 },
  postButton: { backgroundColor: '#000', padding: 14, alignItems: 'center', borderRadius: 6 },
  recentText: { fontSize: 16, fontWeight: '600', marginLeft: 16, marginVertical: 10, color: '#000' },
  postCard: { marginHorizontal: 16, marginBottom: 20, borderRadius: 12, backgroundColor: '#fff', padding: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  userRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatar: { width: 38, height: 38, borderRadius: 19, marginRight: 10 },
  userName: { fontWeight: '600', color: '#000' },
  postTime: { fontSize: 12, color: '#666' },
  postContent: { fontSize: 14, color: '#333', marginVertical: 8 },
  postImage: { width: '100%', height: 200, borderRadius: 10, marginTop: 10 },
  previewImage: { width: '100%', height: 150, borderRadius: 10, marginVertical: 8 },
  reactions: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 12 },
});
