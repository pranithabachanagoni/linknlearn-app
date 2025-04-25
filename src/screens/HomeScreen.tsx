import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const dummyPosts = [
  {
    id: '1',
    name: 'Sophie Harper',
    time: 'Yesterday at 4 PM',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    image: 'https://picsum.photos/id/1011/400/300',
    likes: 20,
    comments: 5,
    shares: 2,
  },
  {
    id: '2',
    name: 'Ethan Williams',
    time: 'Today at 9 AM',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    image: 'https://picsum.photos/id/1018/400/300',
    likes: 15,
    comments: 3,
    shares: 1,
  },
];

export default function HomeScreen() {
  const [postText, setPostText] = useState('');

  const renderPost = ({ item }: any) => (
    <View style={styles.postCard}>
      <View style={styles.userRow}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <View>
          <Text style={styles.userName}>{item.name}</Text>
          <Text style={styles.postTime}>{item.time}</Text>
        </View>
        <Ionicons name="ellipsis-vertical" size={18} color="#888" style={{ marginLeft: 'auto' }} />
      </View>
      <Image source={{ uri: item.image }} style={styles.postImage} />
      <View style={styles.reactions}>
        <Text>❤️ {item.likes}</Text>
        <Text>💬 {item.comments}</Text>
        <Text>↗️ {item.shares}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <Image
          source={{ uri: 'https://randomuser.me/api/portraits/women/45.jpg' }}
          style={styles.headerAvatar}
        />
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
        <TouchableOpacity style={styles.imageButton}>
          <Text style={{ color: '#000' }}>Add Images (max 4)</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.postButton}>
          <Text style={{ color: '#fff', fontWeight: '600' }}>Post</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.recentText}>Recent Posts</Text>
      <FlatList
        data={dummyPosts}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    paddingTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
    color: '#000',
  },
  headerAvatar: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
  },
  postComposer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  composerTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
    color: '#000',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#000',
    marginBottom: 8,
  },
  imageButton: {
    backgroundColor: '#f2f2f2',
    padding: 12,
    alignItems: 'center',
    borderRadius: 6,
    marginBottom: 10,
  },
  postButton: {
    backgroundColor: '#000',
    padding: 14,
    alignItems: 'center',
    borderRadius: 6,
  },
  recentText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 16,
    marginVertical: 10,
    color: '#000',
  },
  postCard: {
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 12,
    backgroundColor: '#fff',
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 10,
  },
  userName: {
    fontWeight: '600',
    color: '#000',
  },
  postTime: {
    fontSize: 12,
    color: '#666',
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginTop: 10,
  },
  reactions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    color: '#000',
  },
});
