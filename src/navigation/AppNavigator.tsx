import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import MoreScreen from '../screens/MoreScreen';
import ProfileStackNavigator from './ProfileStackNavigator';
import NetworkStackNavigator from './NetworkStackNavigator';
import ChatStackNavigator from './ChatStackNavigator';
import ReportIssueScreen from '../screens/ReportIssueScreen';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 12,
        },
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e5e5e5',
          height: 60,
          paddingBottom: 5,
        },
        tabBarIcon: ({ focused }) => {
          let iconName;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Chats':
              iconName = focused ? 'chatbubble' : 'chatbubble-outline';
              break;
            case 'Network':
              iconName = focused ? 'people' : 'people-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            case 'More':
              iconName = focused ? 'ellipsis-horizontal' : 'ellipsis-horizontal-outline';
              break;
            default:
              iconName = 'ellipse';
          }

          return <Ionicons name={iconName} size={22} color={focused ? '#000' : '#888'} />;
        },
        tabBarActiveTintColor: '#000',
        tabBarInactiveTintColor: '#888',
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Network" component={NetworkStackNavigator} />
      <Tab.Screen name="Chats" component={ChatStackNavigator} />
      <Tab.Screen name="Profile" component={ProfileStackNavigator} />
      <Tab.Screen name="More" component={MoreScreen} />
      <Tab.Screen name="ReportIssue" component={ReportIssueScreen} />

    </Tab.Navigator>
  );
}
