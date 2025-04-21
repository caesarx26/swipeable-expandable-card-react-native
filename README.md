# React Native Expandable Card Slider
A highly interactive card component for React Native that supports both swipe gestures and tap interactions to reveal additional content. Perfect for product details, user profiles, settings panels, and more.

## Key Features

### Interactive Behavior
- **✅ Dual Interaction Modes**: Supports both swipe gestures (vertical) and tap-to-toggle
- **🔄 Smooth Animations**: Buttery-smooth 60fps animations during expand/collapse transitions
- **🎮 Gesture Control**: Customizable gesture sensitivity and response curves

### Content Management
- **📏 Smart Height Handling**: Automatically enables scrolling when content exceeds `maxHeight`
- **📱 Responsive Design**: Adapts to different screen sizes and orientations
- **⚡ Performance Optimized**: Uses native driver for animations

### Customization
- **🎨 Theming Support**: Full style customization for all card states
- **🛠️ Component Composition**: Use any React Native components as content
- **🔧 Configurable Transitions**: Adjust animation timing and easing

```jsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import ExpandableCard from 'react-native-expandable-card';

const ProductCard = () => {
  const [expanded, setExpanded] = useState(false);

  // Header component (always visible)
  const Header = () => (
    <View style={styles.header}>
      <Text style={styles.title}>Premium Wireless Headphones</Text>
      <Text style={styles.price}>$199.99</Text>
      <Text style={styles.hint}>
        {expanded ? 'Swipe down to collapse' : 'Swipe up or tap for details'}
      </Text>
    </View>
  );

  // Expandable content
  const Content = () => (
    <ScrollView style={styles.content}>
      <Text style={styles.sectionTitle}>Features</Text>
      <Text style={styles.feature}>• 40mm dynamic drivers</Text>
      <Text style={styles.feature}>• Active noise cancellation</Text>
      <Text style={styles.feature}>• 30-hour battery life</Text>
      
      <Text style={styles.sectionTitle}>Specifications</Text>
      <Text style={styles.spec}>Weight: 254g</Text>
      <Text style={styles.spec}>Bluetooth: 5.0</Text>
      <Text style={styles.spec}>Frequency response: 20Hz-20kHz</Text>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Add to Cart</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <ExpandableCard
        header={<Header />}
        content={<Content />}
        maxHeight={350}
        onExpand={() => setExpanded(true)}
        onCollapse={() => setExpanded(false)}
        animationConfig={{
          duration: 300,
          useNativeDriver: true
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5'
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5
  },
  price: {
    fontSize: 16,
    color: '#2ecc71',
    fontWeight: '600'
  },
  hint: {
    fontSize: 12,
    color: '#95a5a6',
    marginTop: 8,
    fontStyle: 'italic'
  },
  content: {
    padding: 20,
    backgroundColor: '#fff'
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 5,
    color: '#3498db'
  },
  feature: {
    fontSize: 14,
    marginLeft: 10,
    marginBottom: 3
  },
  spec: {
    fontSize: 14,
    marginLeft: 10,
    marginBottom: 3,
    color: '#7f8c8d'
  },
  button: {
    marginTop: 20,
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center'
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold'
  }
});

export default ProductCard;
```jsx