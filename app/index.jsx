// app/index.js
import React from 'react';
import { Text, View, StyleSheet, Pressable } from 'react-native';
import ExpandableBottomSheetCard from '../components/ExpandableBottomSheetCard'; // adjust path if needed

const IndexPage = () => {
  const header = (
    <View style={styles.header}>
      <Text style={styles.headerText}>Welcome!</Text>
    </View>
  );

  const content = (
    <>
      {[...Array(20)].map((_, i) => (
        <View key={i} style={styles.contentItem}>
          <Text>Scrollable Item {i + 1}</Text>
        </View>
      ))}
    </>
  );

  const footer = (
    <View style={styles.footer}>
      <Text style={styles.footerText}>This is the footer</Text>
    </View>
  );

  const onExpansion = () => {
    console.log('Expanded');
  };

  const onCollapse = () => {
    console.log('Collapsed');
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.pageBackground}>
        <Text style={styles.mainText}>Main Page Content (Behind the Sheet)</Text>
      </View>
      <ExpandableBottomSheetCard
        initialPosition="collapsed"
        headerContent={header}
        contentContainerStyle={{}}
        scrollContainerStyle={{ backgroundColor: '#fff' }}
        sheetStyle={{ backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, zIndex: 50 }}
        onExpansion={onExpansion}
        onCollapse={onCollapse}
      >
        {content}
      </ExpandableBottomSheetCard>
    </View>
  );
};

const styles = StyleSheet.create({
  pageBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  mainText: {
    fontSize: 18,
    fontWeight: '500',
  },
  header: {
    padding: 16,
    backgroundColor: '#6200ee',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  headerText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  contentItem: {
    padding: 12,
    marginTop: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
  },
  footer: {
    padding: 16,
    backgroundColor: '#eeeeee',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default IndexPage;
