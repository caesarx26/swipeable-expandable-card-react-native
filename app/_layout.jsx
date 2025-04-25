import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable, StatusBar } from 'react-native';
import { Slot, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SheetProvider, SheetManager } from 'react-native-actions-sheet';
import { usePathname } from 'expo-router';

import './sheets.jsx';


export default function RootLayout() {
  const [menuVisible, setMenuVisible] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  console.log("status bar height", StatusBar.currentHeight);

  const goToPageAndClose = (page) => {
    if (page === pathname) {
      setMenuVisible(false);
      router.replace(pathname);
      return;
    }
    SheetManager.hide("custom-sheet");
    router.push(page);
    setMenuVisible(false);
  };

  return (

    <SafeAreaProvider>
      <GestureHandlerRootView>
        <SheetProvider>

          <StatusBar barStyle="dark-content" backgroundColor={'#fff'} />
          <View style={styles.container}>
            {/* Status bar padding */}
            <View style={styles.statusBarSpacer} />


            {/* Header */}
            <View style={styles.headerContainer}>
              {/* Header background and title */}
              <View style={styles.header}>
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
              <View style={styles.modalOverlay} >
                <View style={styles.sideMenu}>
                  <Pressable onPress={() => setMenuVisible(false)}>
                    <Ionicons name="close" size={24} color="black" />
                  </Pressable>

                  <Pressable onPress={() => goToPageAndClose("/")}>
                    <Text style={styles.link}>Home</Text>
                  </Pressable>

                  <Pressable onPress={() => goToPageAndClose("/message")}>
                    <Text style={styles.link}>message</Text>
                  </Pressable>

                  {/* Add more links here */}
                </View>
              </View>

            </Modal>

            {/* Main content */}


            <Slot />
          </View>
        </SheetProvider>
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
    zIndex: 10,
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
    marginVertical: 20,
  },
});
