import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import ExpandableCard from '../components/SwipeableExpandableCard'; // Adjust path as needed

const App = () => {
  // Base content for the ExpandableCard
  const SimpleBaseContent = () => (
    <View style={styles.baseContent}>
      <View style={styles.baseHeader}>
        <Text style={styles.baseTitle}>Product Details</Text>
        <Text style={styles.baseSubtitle}>Swipe up to see more</Text>
      </View>
      <View style={styles.baseDetails}>
        <Text style={styles.detailLabel}>Product Name:</Text>
        <Text style={styles.detailValue}>Premium Widget 3000</Text>

        <Text style={styles.detailLabel}>Price:</Text>
        <Text style={styles.detailValue}>$199.99</Text>

        <Text style={styles.detailLabel}>Rating:</Text>
        <Text style={styles.detailValue}>★★★★☆ (4.2/5)</Text>
      </View>
    </View>
  );

  // Create a large expandable content with multiple sections to ensure scrolling
  const LargeExpandableContent = () => (
    <View style={styles.expandableContent}>
      <Text style={styles.sectionTitle}>Description</Text>
      <Text style={styles.paragraph}>
        The Premium Widget 3000 is our flagship product, designed with cutting-edge technology
        to meet all your widget needs. Crafted with premium materials and tested under rigorous
        conditions, this widget outperforms all competitors in its class.
      </Text>

      <Text style={styles.sectionTitle}>Features</Text>
      <View style={styles.featuresList}>
        <Text style={styles.featureItem}>• Advanced processing capabilities</Text>
        <Text style={styles.featureItem}>• Seamless integration with existing systems</Text>
        <Text style={styles.featureItem}>• Low power consumption design</Text>
        <Text style={styles.featureItem}>• Compact form factor</Text>
        <Text style={styles.featureItem}>• Durable construction</Text>
        <Text style={styles.featureItem}>• Water and dust resistant (IP68)</Text>
      </View>

      <Text style={styles.sectionTitle}>Technical Specifications</Text>
      <View style={styles.specList}>
        <View style={styles.specItem}>
          <Text style={styles.specLabel}>Dimensions:</Text>
          <Text style={styles.specValue}>5.8 × 2.9 × 0.4 inches</Text>
        </View>
        <View style={styles.specItem}>
          <Text style={styles.specLabel}>Weight:</Text>
          <Text style={styles.specValue}>6.2 ounces</Text>
        </View>
        <View style={styles.specItem}>
          <Text style={styles.specLabel}>Battery:</Text>
          <Text style={styles.specValue}>3000 mAh</Text>
        </View>
        <View style={styles.specItem}>
          <Text style={styles.specLabel}>Connectivity:</Text>
          <Text style={styles.specValue}>Wi-Fi, Bluetooth 5.0, USB-C</Text>
        </View>
        <View style={styles.specItem}>
          <Text style={styles.specLabel}>Materials:</Text>
          <Text style={styles.specValue}>Aluminum, Gorilla Glass</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>User Reviews</Text>
      <View style={styles.reviewsList}>
        <View style={styles.reviewItem}>
          <Text style={styles.reviewHeader}>Excellent product!</Text>
          <Text style={styles.reviewRating}>★★★★★</Text>
          <Text style={styles.reviewText}>
            I've been using the Premium Widget 3000 for three months now and I'm incredibly
            impressed with its performance. It's reliable, fast, and the battery life is amazing.
          </Text>
          <Text style={styles.reviewerName}>- John D.</Text>
        </View>

        <View style={styles.reviewItem}>
          <Text style={styles.reviewHeader}>Great value for money</Text>
          <Text style={styles.reviewRating}>★★★★☆</Text>
          <Text style={styles.reviewText}>
            This widget has all the features I need and works perfectly with my existing setup.
            The only reason I'm not giving it 5 stars is that the setup was a bit complicated.
          </Text>
          <Text style={styles.reviewerName}>- Sarah M.</Text>
        </View>

        <View style={styles.reviewItem}>
          <Text style={styles.reviewHeader}>Exceeded expectations</Text>
          <Text style={styles.reviewRating}>★★★★★</Text>
          <Text style={styles.reviewText}>
            I was skeptical at first due to the price, but after using it for a few weeks,
            I can confidently say it's worth every penny. The build quality is outstanding.
          </Text>
          <Text style={styles.reviewerName}>- Robert T.</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Warranty Information</Text>
      <Text style={styles.paragraph}>
        The Premium Widget 3000 comes with a 2-year limited warranty covering manufacturing
        defects and hardware failures under normal use. Extended warranty options are
        available for purchase separately.
      </Text>

      <Text style={styles.sectionTitle}>Package Contents</Text>
      <View>
        <Text style={styles.packageItem}>• 1 × Premium Widget 3000</Text>
        <Text style={styles.packageItem}>• 1 × USB-C charging cable</Text>
        <Text style={styles.packageItem}>• 1 × Quick start guide</Text>
        <Text style={[styles.packageItem, { marginBottom: 0 }]}>• 1 × Warranty card</Text>
      </View>
    </View >
  );

  // Bottom content with action buttons
  const ActionButtons = () => (
    <View style={styles.actionButtons}>
      <TouchableOpacity style={styles.primaryButton}>
        <Text style={styles.primaryButtonText}>Add to Cart</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.secondaryButton}>
        <Text style={styles.secondaryButtonText}>Save for Later</Text>
      </TouchableOpacity>
    </View>
  );

  // Handle expansion and collapse events
  const handleExpansion = () => {
    console.log('Card expanded');
  };

  const handleCollapse = () => {
    console.log('Card collapsed');
  };

  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.header}>
        <Text style={styles.headerTitle}>This Product</Text>
      </View>

      <ExpandableCard
        rootStyling={styles.card}
        maxHeightForExpandableContent={400} // Set a height that will require scrolling
        baseContent={<SimpleBaseContent />}
        expandableContent={<LargeExpandableContent />}
        bottomContent={<ActionButtons />}
        onExpansion={handleExpansion}
        onCollapse={handleCollapse}
      />

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Try swiping up on the card to see more details, or tap to expand/collapse.
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  cardContainer: {
    padding: 16,
    flex: 1,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  baseContent: {
    padding: 16,
  },
  baseHeader: {
    marginBottom: 16,
  },
  baseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  baseSubtitle: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  baseDetails: {
    marginTop: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
  },
  expandableContent: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
    marginBottom: 16,
  },
  featuresList: {
    marginBottom: 16,
  },
  featureItem: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
    color: '#333',
  },
  specList: {
    marginBottom: 16,
  },
  specItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  specLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    width: 100,
  },
  specValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  reviewsList: {
    marginBottom: 16,
  },
  reviewItem: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  reviewHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  reviewRating: {
    color: '#f4b400',
    marginBottom: 8,
  },
  reviewText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
    marginBottom: 4,
  },
  reviewerName: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#666',
    textAlign: 'right',
  },
  packageItem: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 0,
    color: '#333',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  primaryButton: {
    backgroundColor: '#4285f4',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 0.48,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  secondaryButton: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 0.48,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4285f4',
  },
  secondaryButtonText: {
    color: '#4285f4',
    fontWeight: '600',
    fontSize: 14,
  },
  footer: {
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default App;