import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable, StatusBar } from 'react-native';
import { Slot, useNavigationContainerRef } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';


export default function RootLayout() {
  const [menuVisible, setMenuVisible] = useState(false);
  const navigationRef = useNavigationContainerRef();

  const pageTitle = navigationRef.getCurrentRoute?.()?.name || 'Home';
  console.log("status bar height", StatusBar.currentHeight);

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView>
        <StatusBar barStyle="dark-content" backgroundColor={'#fff'} />
        <View style={styles.container}>
          {/* Status bar padding */}
          <View style={styles.statusBarSpacer} />


          {/* Header */}
          <View style={styles.headerContainer}>
            {/* Header background and title */}
            <View style={styles.header}>
              <Text style={styles.pageTitle}>{pageTitle}</Text>
            </View>

            {/* Floating menu button inside the container */}
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => setMenuVisible(true)}
            >
              <Ionicons name="menu" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Side Menu Modal */}
          <Modal
            visible={menuVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setMenuVisible(false)}
          >
            <Pressable style={styles.modalOverlay} onPress={() => setMenuVisible(false)}>
              <View style={styles.sideMenu}>
                <Text style={styles.link}>Home</Text>
                <Text style={styles.link}>Profile</Text>
                <Text style={styles.link}>Settings</Text>
                {/* Add more links here */}
              </View>
            </Pressable>
          </Modal>

          {/* Main content */}


          <Slot />
        </View>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statusBarSpacer: {
    paddingTop: 0,
    backgroundColor: '#fff',
  },
  headerContainer: {
    marginTop: 24, // Handle space here
    position: 'relative',
    backgroundColor: '#fff',
  },

  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },

  menuButton: {
    position: 'absolute',
    top: 0, // Top relative to headerContainer
    left: 10,
    backgroundColor: '#333',
    borderRadius: 20,
    padding: 10,
    zIndex: 2,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    flexDirection: 'row',
  },
  sideMenu: {
    width: '70%',
    backgroundColor: '#fff',
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  link: {
    fontSize: 18,
    marginBottom: 20,
  },
});
