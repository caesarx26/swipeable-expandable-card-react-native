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

### Example

```jsx
import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import SwipeableExpandableCard from './SwipeableExpandableCard'; // Adjust the path

const ProductCard = () => {
  const baseContent = (
    <View style={styles.baseContainer}>
      <Text style={styles.title}>Awesome Gadget</Text>
      <Text style={styles.subtitle}>Tap or swipe up for details</Text>
    </View>
  );

  const expandableContent = (
    <View style={styles.expandedContainer}>
      <Text style={styles.heading}>Product Description</Text>
      <Text style={styles.paragraph}>
        This awesome gadget will change your life! It has many features and is very easy to use.
        Read more below for detailed specifications.
      </Text>
      <Text style={styles.heading}>Specifications</Text>
      <Text style={styles.listItem}>• Power: 100W</Text>
      <Text style={styles.listItem}>• Dimensions: 10x5x2 cm</Text>
      <Text style={styles.listItem}>• Weight: 150g</Text>
    </View>
  );

  const bottomContent = (
    <View style={styles.bottomContainer}>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Add to Cart</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>View Reviews</Text>
      </TouchableOpacity>
    </View>
  );

  const handleExpand = () => {
    console.log('Product card expanded');
  };

  const handleCollapse = () => {
    console.log('Product card collapsed');
  };

  return (
    <View style={styles.cardWrapper}>
      <SwipeableExpandableCard
        baseContent={baseContent}
        expandableContent={expandableContent}
        bottomContent={bottomContent}
        maxHeightForExpandableContent={200}
        onExpansion={handleExpand}
        onCollapse={handleCollapse}
        rootStyling={styles.card}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    padding: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    overflow: 'hidden', // Important for rounded corners with absolute positioning
  },
  baseContainer: {
    padding: 15,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: 'gray',
  },
  expandedContainer: {
    padding: 15,
    backgroundColor: '#f9f9f9',
  },
  heading: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },
  listItem: {
    fontSize: 14,
    marginLeft: 15,
    marginVertical: 3,
  },
  bottomContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    backgroundColor: '#eee',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
export default ProductCard;
```