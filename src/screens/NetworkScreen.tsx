import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import PendingRequests from './Network/PendingRequests';
import SentRequests from './Network/SentRequests';
import SearchUsers from './Network/SearchUsers'; // ← make sure this file exists
import Links from './Network/Links';

const TABS = ['Pending Requests', 'Sent Requests', 'Links', 'Search'];

const NetworkScreen = () => {
  const [activeTab, setActiveTab] = useState('Pending Requests');
  const [searchText, setSearchText] = useState('');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Pending Requests':
        return <PendingRequests />;
      case 'Sent Requests':
        return <SentRequests />;
      case 'Search':
        return <SearchUsers />;
      case 'Links':
        return <Links />;

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TextInput
        placeholder="Search"
        value={searchText}
        onChangeText={setSearchText}
        style={styles.search}
      />

      <View style={styles.tabBar}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={styles.tabButton}
          >
            <Text
              style={[styles.tabText, activeTab === tab && styles.activeTab]}
            >
              {tab}
            </Text>
            {activeTab === tab && <View style={styles.activeUnderline} />}
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ flex: 1 }}>{renderTabContent()}</View>
    </SafeAreaView>
  );
};

export default NetworkScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  search: {
    backgroundColor: '#f1f1f1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 12,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  tabButton: { alignItems: 'center', paddingBottom: 8 },
  tabText: { fontSize: 14, color: '#888' },
  activeTab: { color: '#000', fontWeight: '700' },
  activeUnderline: {
    height: 2,
    backgroundColor: '#000',
    width: '100%',
    marginTop: 4,
    borderRadius: 4,
  },
  placeholder: {
    textAlign: 'center',
    marginTop: 50,
    color: '#666',
  },
});
