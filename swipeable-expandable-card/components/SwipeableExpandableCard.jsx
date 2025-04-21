import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Animated,
  PanResponder,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';

const SCREEN_HEIGHT = Dimensions.get('window').height;

const SwipeableExpandableCard = ({
  rootStyling = {},
  maxHeightForExpandableContent = 300,
  baseContent,
  expandableContent,
  bottomContent,
  onExpansion,
  onCollapse,
}) => {
  const [baseHeight, setBaseHeight] = useState(0);
  const [expandableHeight, setExpandableHeight] = useState(0);
  const [bottomHeight, setBottomHeight] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const isExpandedRef = useRef(false); // Sync ref for gestures
  const heightAnim = useRef(new Animated.Value(0)).current;

  const totalContentHeight = expandableHeight + (bottomContent ? bottomHeight : 0);

  const setExpandedState = (value) => {
    isExpandedRef.current = value;
    setIsExpanded(value);
  };

  useEffect(() => {
    console.log('Animating height to', isExpanded ? maxHeightForExpandableContent : 0);
    Animated.timing(heightAnim, {
      toValue: isExpanded ? Math.min(totalContentHeight, maxHeightForExpandableContent) : 0,
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      isExpanded ? onExpansion?.() : onCollapse?.();
    });
  }, [isExpanded, totalContentHeight, maxHeightForExpandableContent]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        console.log('Swiping...', gestureState.dy);

        if (gestureState.dy < -30 && !isExpandedRef.current) {
          console.log('Swipe up detected — expanding');
          setExpandedState(true);
        } else if (gestureState.dy > 30 && isExpandedRef.current) {
          console.log('Swipe down detected — collapsing');
          setExpandedState(false);
        }
      },
      onPanResponderRelease: () => {
        console.log('Gesture released');
      },
    })
  ).current;

  return (
    <View style={[styles.root, rootStyling]} {...panResponder.panHandlers}>
      {/* Hidden measurements */}
      <View style={styles.hidden} onLayout={(e) => setBaseHeight(e.nativeEvent.layout.height)}>
        {baseContent}
      </View>
      <View
        style={styles.hidden}
        onLayout={(e) => setExpandableHeight(e.nativeEvent.layout.height)}>
        {expandableContent}
      </View>
      {bottomContent && (
        <View style={styles.hidden} onLayout={(e) => setBottomHeight(e.nativeEvent.layout.height)}>
          {bottomContent}
        </View>
      )}

      {/* Visible content */}
      <View>{baseContent}</View>

      <Animated.View style={{ height: heightAnim, overflow: 'hidden' }}>
        <ScrollView
          scrollEnabled={totalContentHeight > maxHeightForExpandableContent}
          contentContainerStyle={{ paddingBottom: 10 }}
          style={{ maxHeight: maxHeightForExpandableContent }}>
          {expandableContent}
        </ScrollView>
      </Animated.View>

      {/* Bottom content shown only when expanded */}
      {isExpanded && bottomContent}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    width: '100%',
    overflow: 'hidden',
  },
  hidden: {
    position: 'absolute',
    zIndex: -1,
    opacity: 0,
    height: 'auto',
  },
});

export default SwipeableExpandableCard;
