import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, Dimensions, Animated, PanResponder, Easing, TouchableWithoutFeedback, Platform } from 'react-native';
const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;
const DEFAULT_SCROLL_MAX_HEIGHT = SCREEN_HEIGHT * 0.9; // Default max height for scrollable content
import { useSafeAreaInsets } from 'react-native-safe-area-context';


const BottomSheetCard = ({
  minHeight = 100,
  initialPosition = 'collapsed',
  children,
  headerContent,
  sheetStyle,
  scrollContainerStyle,
  scrollMaxHeight = DEFAULT_SCROLL_MAX_HEIGHT,
  contentContainerStyle,
  showVerticalScrollIndicator = true,
  onCollapse,
  onExpansion,
}) => {
  const maxHeight = minHeight + scrollMaxHeight;
  const translateY = useRef(new Animated.Value(0)).current;
  const lastOffsetY = useRef(0);
  const [isReady, setIsReady] = useState(false);
  const [isFullyExpanded, setIsFullyExpanded] = useState(initialPosition !== 'collapsed');
  const scrollViewRef = useRef(null);

  // Track if a gesture is in progress to prevent gesture conflicts
  const isGestureInProgress = useRef(false);

  // Calculate initial position
  const getInitialOffset = () =>
    initialPosition === 'collapsed'
      ? maxHeight - minHeight
      : maxHeight - maxHeight;

  // Init sheet with a two-phase approach to prevent flashing
  useEffect(() => {
    // Phase 1: Set initial position without animation, but don't show yet
    const initialOffset = getInitialOffset();
    translateY.setValue(initialOffset);
    lastOffsetY.current = initialOffset;

    setIsReady(true);
  }, []);

  // Add value listener to track expanded state
  useEffect(() => {
    const listener = translateY.addListener(({ value }) => {
      // Update fully expanded state with a tighter threshold
      setIsFullyExpanded(Math.abs(value - (maxHeight - maxHeight)) < 2);
    });

    return () => translateY.removeListener(listener);
  }, []);

  // Function to animate the bottom sheet to a specific position
  const animateToPosition = (expanded) => {
    const targetPosition = expanded
      ? maxHeight - maxHeight  // Fully expanded
      : maxHeight - minHeight; // Collapsed

    // call onCollapse or onExpansion
    if (!expanded) {
      onCollapse();
    } else {
      onExpansion();
    }

    // reset states
    setHasScrolledDown(false);
    setTopScrollUpCount(0);
    lastScrollY.current = 0;
    scrollViewRef.current?.scrollTo({ y: 0, animated: false });

    Animated.timing(translateY, {
      toValue: targetPosition,
      duration: 250,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      useNativeDriver: true
    }).start(() => {
      lastOffsetY.current = targetPosition;
    });
  };

  // Toggle expansion state when header is tapped
  const handleHeaderTap = () => {
    // Don't handle taps if a gesture is in progress
    if (isGestureInProgress.current) return;

    // Toggle between expanded and collapsed
    animateToPosition(!isFullyExpanded);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // If fully expanded and scrolling down, let the ScrollView handle it
        if (isFullyExpanded && scrollViewRef.current && gestureState.dy > 0) {
          // Check if ScrollView is at the top
          const scrollViewHandlesIt = scrollViewRef.current.contentOffset?.y > 0;
          return !scrollViewHandlesIt;
        }

        // Even more sensitive dragging
        return Math.abs(gestureState.dy) > 1;
      },
      onPanResponderGrant: () => {
        // Mark that a gesture is in progress
        isGestureInProgress.current = true;

        // Stop any ongoing animations to ensure smooth transition to dragging
        translateY.stopAnimation(value => {
          lastOffsetY.current = value;
        });
      },
      onPanResponderMove: (_, gestureState) => {
        const minTranslateY = maxHeight - maxHeight;
        const maxTranslateY = maxHeight - minHeight;
        const newY = lastOffsetY.current + gestureState.dy;

        // Improved direct mapping with minimal resistance for smoother feel
        if (newY >= minTranslateY && newY <= maxTranslateY) {
          // Direct value setting for immediate response
          translateY.setValue(newY);
        } else if (newY < minTranslateY) {
          // Very slight resistance when pulling beyond max height
          const overshoot = minTranslateY - newY;
          translateY.setValue(minTranslateY - (overshoot * 0.1));
        } else {
          // Very slight resistance when pushing below min height
          const overshoot = newY - maxTranslateY;
          translateY.setValue(maxTranslateY + (overshoot * 0.1));
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        const minTranslateY = maxHeight - maxHeight;
        const maxTranslateY = maxHeight - minHeight;
        const currentY = translateY._value;

        // More sensitive velocity detection
        let finalY;
        if (Math.abs(gestureState.vy) > 0.1) {
          // Direction based on velocity with a lower threshold
          finalY = gestureState.vy > 0 ? maxTranslateY : minTranslateY;
        } else {
          // Position-based snapping with better midpoint calculation
          const snapRatio = 0.5; // Equal midpoint for more predictable behavior
          const snapThreshold = minTranslateY + ((maxTranslateY - minTranslateY) * snapRatio);
          finalY = currentY < snapThreshold ? minTranslateY : maxTranslateY;
        }

        // Ensure we're within bounds
        finalY = Math.max(minTranslateY, Math.min(finalY, maxTranslateY));

        // Use timing instead of spring for more controlled animation
        Animated.timing(translateY, {
          toValue: finalY,
          duration: 250, // Shorter duration for quicker feel
          easing: Easing.bezier(0.25, 0.1, 0.25, 1), // Custom easing for smooth motion
          useNativeDriver: true
        }).start(() => {
          lastOffsetY.current = finalY;

          // reset states
          setHasScrolledDown(false);
          setTopScrollUpCount(0);
          lastScrollY.current = 0;
          scrollViewRef.current?.scrollTo({ y: 0, animated: false });
          console.log("reset states");

          // Log expanded or collapsed
          if (finalY === minTranslateY) {
            onExpansion();
          } else if (finalY === maxTranslateY) {
            onCollapse();
          }


          // Reset gesture in progress flag after animation completes
          setTimeout(() => {
            isGestureInProgress.current = false;
          }, 100);
        });
      },
      onPanResponderTerminate: () => {
        // Reset gesture in progress flag
        isGestureInProgress.current = false;
      }
    })
  ).current;

  // Scroll tracking state
  const [hasScrolledDown, setHasScrolledDown] = useState(false);
  const [topScrollUpCount, setTopScrollUpCount] = useState(0);
  const lastScrollY = useRef(0);

  const handleEndDrag = (event) => {
    if (!isFullyExpanded) return;


    const offsetY = event.nativeEvent.contentOffset.y;
    const isAtTop = offsetY <= 0;

    // check if user scrolled bottom and set hasScrolledDown flag
    if (!hasScrolledDown && offsetY > lastScrollY.current) {
      setHasScrolledDown(true);
      lastScrollY.current = offsetY;
      setTopScrollUpCount(0);
      return;
    }

    if (hasScrolledDown && topScrollUpCount >= 1) {
      animateToPosition(false);
      setHasScrolledDown(false);
      setTopScrollUpCount(0);
      lastScrollY.current = 0;
    }

    if (hasScrolledDown && isAtTop) {
      setTopScrollUpCount(topScrollUpCount + 1);
      lastScrollY.current = offsetY;
      return;
    }

    console.log("isAtTop onEndDrag", isAtTop);
    console.log("hasScrolledDown onEndDrag", hasScrolledDown);

    if (isAtTop && !hasScrolledDown) {
      console.log("collapsing from onEndDrag");
      animateToPosition(false);
      setHasScrolledDown(false);
      setTopScrollUpCount(0);
      lastScrollY.current = 0;
    }

    lastScrollY.current = offsetY;
  };

  const handleScroll = (event) => {
    if (!isFullyExpanded) return;
    const offsetY = event.nativeEvent.contentOffset.y;

    // check if user scrolled bottom and set hasScrolledDown flag
    if (!hasScrolledDown && offsetY > lastScrollY.current) {
      setHasScrolledDown(true);
      setTopScrollUpCount(0);
      lastScrollY.current = offsetY;
    }

  }

  // Create a touchable wrapper for the header
  const HeaderWithTouchable = () => {
    return (
      <TouchableWithoutFeedback onPress={handleHeaderTap}>
        <View>
          {headerContent}
        </View>
      </TouchableWithoutFeedback>
    );
  };

  return (
    <Animated.View
      style={[
        sheetStyle,
        {
          transform: [{ translateY }],
          opacity: isReady ? 1 : 0,
        }
      ]}
    >
      {/* Render header with touchable and pan responder */}
      <View {...panResponder.panHandlers}>
        <HeaderWithTouchable />
      </View>

      <ScrollView
        ref={scrollViewRef}

        style={[
          { maxHeight: scrollMaxHeight },
          scrollContainerStyle,
        ]}
        contentContainerStyle={[
          contentContainerStyle
        ]}
        showsVerticalScrollIndicator={showVerticalScrollIndicator}
        scrollEventThrottle={16}
        bounces={false}
        onScrollEndDrag={handleEndDrag}
        onScroll={handleScroll}
      >
        <View>
          {children}
        </View>
      </ScrollView>
    </Animated.View >
  );
};

const ExpandableBottomSheetCard = ({
  initialPosition = 'collapsed',
  children,
  headerContent,
  sheetStyle,
  scrollContainerStyle,
  scrollMaxHeight,
  contentContainerStyle,
  showVerticalScrollIndicator = true,
  footerContent,
  onExpansion,
  onCollapse
}) => {
  const insets = useSafeAreaInsets();
  const [headerHeight, setHeaderHeight] = useState(null);
  const [contentHeight, setContentHeight] = useState(null);
  const [footerHeight, setFooterHeight] = useState(null);
  const [isReady, setIsReady] = useState(false);

  const onHeaderLayout = (event) => setHeaderHeight(event.nativeEvent.layout.height);
  const onContentLayout = (event) => setContentHeight(event.nativeEvent.layout.height);
  const onFooterLayout = (event) => footerContent && setFooterHeight(event.nativeEvent.layout.height);

  console.log("headerHeight", headerHeight);

  useEffect(() => {
    if (headerHeight != null && contentHeight != null) {
      if (footerContent) {
        if (footerHeight != null) setIsReady(true);
      } else {
        setIsReady(true);
      }
    }
  }, [headerHeight, contentHeight, footerHeight]);

  if (!isReady) {
    return (
      <View style={{ position: 'absolute', opacity: 0 }}>
        <View onLayout={onHeaderLayout}>{headerContent}</View>
        <ScrollView>
          <View onLayout={onContentLayout}>{children}</View>
        </ScrollView>
        {footerContent && <View onLayout={onFooterLayout}>{footerContent}</View>}
      </View>
    );
  }

  const calculatedFooterHeight = footerContent ? footerHeight : 0;
  const calculatedMinHeight = headerHeight + calculatedFooterHeight;
  const { top } = insets;
  const calculatedHeightForStatusBar = Platform.OS === 'ios' ? (top > 0 ? (top * 2 + 20) : 60) : (top > 0 ? top : 30);
  console.log("contentHeight", contentHeight);
  console.log("calculatedFooterHeight", calculatedFooterHeight);
  let baseMaxHeight = scrollMaxHeight ?? (
    SCREEN_HEIGHT - calculatedHeightForStatusBar - calculatedFooterHeight - (Platform.OS === 'ios' ? 40 : 27)
  );

  const calculatedMaxHeightForScrollView = contentHeight < baseMaxHeight
    ? contentHeight
    : baseMaxHeight;

  console.log("calculatedMaxHeightForScrollView", calculatedMaxHeightForScrollView);

  return (
    <View style={[{ position: 'absolute', bottom: 0, left: 0, right: 0 }]}>
      <BottomSheetCard
        initialPosition={initialPosition}
        sheetStyle={sheetStyle}
        scrollContainerStyle={scrollContainerStyle}
        scrollMaxHeight={calculatedMaxHeightForScrollView}
        contentContainerStyle={contentContainerStyle}
        headerContent={headerContent}
        minHeight={calculatedMinHeight}
        showVerticalScrollIndicator={showVerticalScrollIndicator}
        onCollapse={onCollapse}
        onExpansion={onExpansion}
      >
        {children}
      </BottomSheetCard>

      {footerContent && (
        <View style={{ zIndex: sheetStyle?.zIndex ?? 2 }}>
          {footerContent}
        </View>
      )}

    </View>

  );
};



export default ExpandableBottomSheetCard;



