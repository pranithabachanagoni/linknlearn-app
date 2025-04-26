import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native'; // ✅

const MoreScreen = () => {
  const { logout } = useAuth();
  const navigation = useNavigation();

  const handlePress = (title: string) => {
    if (title === 'Report an Issue') {
      navigation.navigate('ReportIssue' as never); // ✅ Correct way
    } else {
      Alert.alert(title, `You tapped on "${title}"`);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity style={styles.item} onPress={() => handlePress('Profile Settings')}>
          <Ionicons name="person-outline" size={22} color="#555" style={styles.icon} />
          <Text style={styles.text}>Profile Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.item} onPress={() => handlePress('Notifications')}>
          <Ionicons name="notifications-outline" size={22} color="#555" style={styles.icon} />
          <Text style={styles.text}>Notifications</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.item} onPress={() => handlePress('Privacy')}>
          <Ionicons name="lock-closed-outline" size={22} color="#555" style={styles.icon} />
          <Text style={styles.text}>Privacy</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.item} onPress={() => handlePress('Help Center')}>
          <Ionicons name="help-circle-outline" size={22} color="#555" style={styles.icon} />
          <Text style={styles.text}>Help Center</Text>
        </TouchableOpacity>

        {/* ✅ New item for Report */}
        <TouchableOpacity style={styles.item} onPress={() => handlePress('Report an Issue')}>
          <Ionicons name="alert-circle-outline" size={22} color="#f00" style={styles.icon} />
          <Text style={[styles.text, { color: '#f00' }]}>Report an Issue</Text>
        </TouchableOpacity>

        {/* Logout stays same */}
        <TouchableOpacity style={[styles.item, { marginTop: 30 }]} onPress={logout}>
          <Ionicons name="log-out-outline" size={22} color="red" style={styles.icon} />
          <Text style={[styles.text, { color: 'red' }]}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default MoreScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scroll: {
    paddingVertical: 20,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
  },
  icon: {
    marginRight: 15,
  },
  text: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
});
