// HomeScreen.tsx

import React from 'react';
import { View, Text, Button } from 'react-native';
import { auth } from '../config/firebase';

const HomeScreen = ({ navigation }: any) => {
  const handleLogout = async () => {
    await auth.signOut();
    navigation.replace('Login');
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Welcome to LinknLearn 🎉</Text>
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
};

export default HomeScreen;
