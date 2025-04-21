import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Animated,
  PanResponder,
  StyleSheet,
  TouchableWithoutFeedback,
  ScrollView,
  Dimensions,
} from 'react-native';

// ... (Keep the rest of the component code: props, state, refs, height calculations, useEffect, animations, toggleExpansion, handleTap, handleScroll, Render structure) ...

const ExpandableCard = ({
  rootStyling,
  maxHeightForExpandableContent = 300,
  baseContent,
  expandableContent,
  bottomContent,
  onExpansion,
  onCollapse,
}) => {
  // ... (state, refs, calculations, useEffect, animations, actions - ALL SAME AS PREVIOUS VERSION) ...
  const [isExpanded, setIsExpanded] = useState(false);
  const [baseContentHeight, setBaseContentHeight] = useState(0);
  const [expandableContentHeight, setExpandableContentHeight] = useState(0);
  const [bottomContentHeight, setBottomContentHeight] = useState(0);
  const [isLayoutCalculated, setIsLayoutCalculated] = useState(false);
  const [isDraggingCard, setIsDraggingCard] = useState(false);

  const expandAnimation = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);
  const scrollOffset = useRef(0);
  const viewRef = useRef(null);


  const effectiveExpandableHeight = Math.min(
    expandableContentHeight,
    maxHeightForExpandableContent
  );

  const totalExpandedHeight = isLayoutCalculated
    ? baseContentHeight + effectiveExpandableHeight + (bottomContent ? bottomContentHeight : 0)
    : baseContentHeight;

  useEffect(() => {
    if (baseContentHeight > 0 && expandableContentHeight > 0) {
      if (bottomContent && bottomContentHeight === 0) {
        setIsLayoutCalculated(false);
      } else {
        setIsLayoutCalculated(true);
      }
    } else {
      setIsLayoutCalculated(false);
    }
  }, [baseContentHeight, expandableContentHeight, bottomContentHeight, bottomContent]);


  const animatedContainerHeight = expandAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [
      baseContentHeight > 0 ? baseContentHeight : 0,
      isLayoutCalculated ? totalExpandedHeight : (baseContentHeight > 0 ? baseContentHeight : 0)
    ],
    extrapolate: 'clamp',
  });

  const animatedContentOpacity = expandAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
    extrapolate: 'clamp',
  });

  const animatedBottomOpacity = expandAnimation.interpolate({
    inputRange: [0, 0.8, 1],
    outputRange: [0, 0, 1],
    extrapolate: 'clamp',
  });


  const runAnimation = useCallback((toValue) => {
    Animated.timing(expandAnimation, {
      toValue: toValue,
      duration: 300,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {
        const newExpanded = toValue === 1;
        setIsExpanded(newExpanded); // Update state *after* animation finishes

        if (newExpanded) {
          onExpansion?.();
        } else {
          onCollapse?.();
          scrollViewRef.current?.scrollTo({ y: 0, animated: false });
          scrollOffset.current = 0;
        }
      }
    });
  }, [expandAnimation, onExpansion, onCollapse]);

  const toggleExpansion = useCallback(() => {
    if (!isLayoutCalculated) return;
    runAnimation(isExpanded ? 0 : 1);
  }, [isExpanded, isLayoutCalculated, runAnimation]);

  const handleTap = () => {
    if (!isDraggingCard) {
      toggleExpansion();
    }
  };

  const handleScroll = (event) => {
    scrollOffset.current = event.nativeEvent.contentOffset.y;
  };


  // --- REVISED PanResponder ---
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        const { dy, dx } = gestureState;

        // Don't activate if layout isn't ready
        if (!isLayoutCalculated) return false;

        // Check for vertical dominance and minimum distance
        const isVerticalSwipe = Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 10; // Increased threshold
        if (!isVerticalSwipe) return false;

        if (isExpanded) {
          // --- Card is Expanded ---
          if (dy < 0) {
            // Swiping UP: NEVER let the PanResponder take control.
            // Let the ScrollView handle scrolling up.
            return false;
          } else {
            // Swiping DOWN (dy > 0):
            // PanResponder takes control ONLY if ScrollView is at the top.
            const isScrollViewAtTop = scrollOffset.current < 1; // Use a small tolerance
            return isScrollViewAtTop; // Activate PanResponder for collapse
          }
        } else {
          // --- Card is Collapsed ---
          // Activate PanResponder ONLY if swiping UP (dy < 0) to expand.
          return dy < 0;
        }
      },

      // Grant, Move, Release, Terminate handlers remain the same as they handle
      // the animation *after* the PanResponder has been granted control.
      onPanResponderGrant: () => {
        setIsDraggingCard(true);
        expandAnimation.stopAnimation(); // Stop any ongoing animation
      },
      onPanResponderMove: (_, gestureState) => {
        const { dy } = gestureState;
        const dragDistance = isExpanded ? dy : -dy; // How far from initial state
        const fullDragHeight = totalExpandedHeight - baseContentHeight;

        if (fullDragHeight <= 0) return;

        // Calculate the target animation value based on the drag
        let currentVal = expandAnimation._value; // Get current animation value (more reliable during drag)
        let moveValue = dragDistance / fullDragHeight;

        let nextValue;
        if (isExpanded) {
          // Start from 1 (expanded) and subtract normalized drag distance
          nextValue = 1 - moveValue;
        } else {
          // Start from 0 (collapsed) and add normalized drag distance
          nextValue = moveValue;
        }

        // Clamp between 0 and 1
        nextValue = Math.max(0, Math.min(1, nextValue));
        expandAnimation.setValue(nextValue);
      },
      onPanResponderRelease: (_, gestureState) => {
        setIsDraggingCard(false);
        const { dy, vy } = gestureState;
        const currentValue = expandAnimation._value;

        // Determine target state based on velocity and position
        let targetValue = 0; // Default to collapse
        if (isExpanded) {
          // If expanded, collapse if swiped down significantly OR if released below ~70% expanded
          if (vy > 0.4 || (dy > 0 && currentValue < 0.7)) {
            targetValue = 0;
          } else {
            targetValue = 1; // Snap back to expanded
          }
        } else {
          // If collapsed, expand if swiped up significantly OR if released above ~30% expanded
          if (vy < -0.4 || (dy < 0 && currentValue > 0.3)) {
            targetValue = 1;
          } else {
            targetValue = 0; // Snap back to collapsed
          }
        }
        runAnimation(targetValue);
      },
      onPanResponderTerminate: () => {
        // Gesture was interrupted
        setIsDraggingCard(false);
        // Snap back to the closest stable state
        runAnimation(expandAnimation._value > 0.5 ? 1 : 0);
      },

      // --- IMPORTANT CHANGE ---
      // Allow native responders (like ScrollView) to intercept the gesture.
      // This prevents the PanResponder from being too greedy.
      onShouldBlockNativeResponder: () => false,

    })
  ).current;
  // --- End of REVISED PanResponder ---


  // --- Render --- (Keep the exact same JSX structure as the previous working version)
  const handlers = isLayoutCalculated ? panResponder.panHandlers : {};

  return (
    <>
      {/* Hidden measurement views - Same */}
      <View style={styles.hiddenView} pointerEvents="none">
        <View onLayout={(e) => setBaseContentHeight(e.nativeEvent.layout.height)}>
          {baseContent}
        </View>
        <View onLayout={(e) => setExpandableContentHeight(e.nativeEvent.layout.height)}>
          {expandableContent}
        </View>
        {bottomContent && (
          <View onLayout={(e) => setBottomContentHeight(e.nativeEvent.layout.height)}>
            {bottomContent}
          </View>
        )}
      </View>

      {/* Actual Visible Component - Same Structure */}
      <TouchableWithoutFeedback onPress={handleTap} disabled={!isLayoutCalculated}>
        <Animated.View
          ref={viewRef}
          style={[styles.container, rootStyling, { height: animatedContainerHeight }]}
          {...handlers}
        >
          {/* 1. Base Content */}
          <View>{baseContent}</View>

          {/* 2. Expandable Content Section */}
          <View
            style={styles.expandableContentContainer}
            pointerEvents={isExpanded ? 'auto' : 'none'}
          >
            {expandableContentHeight > maxHeightForExpandableContent ? (
              <Animated.ScrollView
                ref={scrollViewRef}
                style={[styles.scrollView, { maxHeight: effectiveExpandableHeight, opacity: animatedContentOpacity }]}
                contentContainerStyle={styles.scrollViewContent}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                nestedScrollEnabled={true}
              >
                {expandableContent}
              </Animated.ScrollView>
            ) : (
              <Animated.View style={[{ maxHeight: effectiveExpandableHeight, opacity: animatedContentOpacity }]}>
                {expandableContent}
              </Animated.View>
            )}
          </View>

          {/* 3. Bottom Content Section */}
          {bottomContent && (
            <View
              style={[
                styles.bottomContentWrapper,
                (isExpanded || expandAnimation._value > 0.8) ? styles.bottomContentBorder : {},
              ]}
              pointerEvents={isExpanded ? 'auto' : 'none'}
            >
              <Animated.View style={{ opacity: animatedBottomOpacity }}>
                {bottomContent}
              </Animated.View>
            </View>
          )}
        </Animated.View>
      </TouchableWithoutFeedback>
    </>
  );
};

// --- Styles --- (Keep the exact same styles as the previous working version)
const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    overflow: 'hidden', // Essential!
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  expandableContentContainer: {
    overflow: 'hidden',
  },
  scrollView: {},
  scrollViewContent: {
    paddingBottom: 10,
  },
  bottomContentWrapper: {},
  bottomContentBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e0e0e0',
  },
  hiddenView: {
    position: 'absolute',
    top: 0,
    left: 0,
    opacity: 0,
    zIndex: -100,
    width: Dimensions.get('window').width,
    pointerEvents: 'none',
  },
});

export default ExpandableCard;