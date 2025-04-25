import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import NetworkScreen from '../screens/NetworkScreen';
import UserProfileView from '../screens/Profile/UserProfileView';
import Links from '../screens/Network/Links';
import PendingRequests from '../screens/Network/PendingRequests';
import SentRequests from '../screens/Network/SentRequests';
import SearchUsers from '../screens/Network/SearchUsers';

const Stack = createNativeStackNavigator();

const NetworkStackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="NetworkMain" component={NetworkScreen} options={{ headerShown: false }} />
      <Stack.Screen name="UserProfileView" component={UserProfileView} options={{ title: 'Profile' }} />
      <Stack.Screen name="Links" component={Links} options={{ title: 'Connections' }} />
      <Stack.Screen name="PendingRequests" component={PendingRequests} options={{ title: 'Pending Requests' }} />
      <Stack.Screen name="SentRequests" component={SentRequests} options={{ title: 'Sent Requests' }} />
      <Stack.Screen name="SearchUsers" component={SearchUsers} options={{ title: 'Search Users' }} />
    </Stack.Navigator>
  );
};

export default NetworkStackNavigator;
