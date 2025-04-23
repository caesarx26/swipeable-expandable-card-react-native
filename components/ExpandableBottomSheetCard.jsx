import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, Dimensions, Animated, PanResponder, StatusBar, StyleSheet } from 'react-native';
const SCREEN_HEIGHT = Dimensions.get('window').height;
const STATUS_BAR_HEIGHT = StatusBar.currentHeight || 0;
const DEFAULT_SCROLL_MAX_HEIGHT = SCREEN_HEIGHT * 0.9; // Default max height for scrollable content
const ANIMATION_CONFIG = {
  tension: 20,
  friction: 4,
  useNativeDriver: false
};

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
}) => {
  console.log("full height window:", SCREEN_HEIGHT);;
  console.log("min height passed", minHeight);
  console.log("scroll max height passed: ", scrollMaxHeight, "and default scroll max height", SCREEN_HEIGHT * 0.9);
  const maxHeight = minHeight + scrollMaxHeight;
  const translateY = useRef(new Animated.Value(0)).current;
  const lastOffsetY = useRef(0);
  const [isReady, setIsReady] = useState(false);
  const [isFullyExpanded, setIsFullyExpanded] = useState(false);
  const scrollViewRef = useRef(null);

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

    console.log('Initial offset set:', initialOffset);
    console.log('Initial height would be:', maxHeight - initialOffset);

    // Phase 2: After a short delay to ensure layout is ready, make visible
    const timer = setTimeout(() => {
      setIsReady(true);
      console.log('Sheet ready to display');
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Add value listener to log translateY changes and track expanded state
  useEffect(() => {
    const listener = translateY.addListener(({ value }) => {
      const currentHeight = maxHeight - value;
      console.log('Current sheet height:', currentHeight);

      // Update fully expanded state
      setIsFullyExpanded(Math.abs(value - (maxHeight - maxHeight)) < 5);
    });

    return () => translateY.removeListener(listener);
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // If fully expanded and scrolling down (negative vy), let the ScrollView handle it
        if (isFullyExpanded && scrollViewRef.current && gestureState.dy > 0) {
          // Check if ScrollView is at the top
          const scrollViewHandlesIt = scrollViewRef.current.contentOffset?.y > 0;
          return !scrollViewHandlesIt;
        }

        // More sensitive dragging - lower threshold to activate
        return Math.abs(gestureState.dy) > 2;
      },
      onPanResponderGrant: () => {
        // Stop any ongoing animations to ensure smooth transition to dragging
        translateY.stopAnimation();
        console.log('Pan responder grant - drag started');
      },
      onPanResponderMove: (_, gestureState) => {
        const minTranslateY = maxHeight - maxHeight;
        const maxTranslateY = maxHeight - minHeight;
        const newY = lastOffsetY.current + gestureState.dy;

        // Direct mapping without resistance within bounds for more responsive dragging
        if (newY >= minTranslateY && newY <= maxTranslateY) {
          translateY.setValue(newY);
        } else if (newY < minTranslateY) {
          // Minimal resistance when pulling beyond max height
          const overshoot = minTranslateY - newY;
          translateY.setValue(minTranslateY - (overshoot * 0.2));
        } else {
          // Minimal resistance when pushing below min height
          const overshoot = newY - maxTranslateY;
          translateY.setValue(maxTranslateY + (overshoot * 0.2));
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        console.log('Pan responder release - drag ended');
        const minTranslateY = maxHeight - maxHeight;
        const maxTranslateY = maxHeight - minHeight;
        const currentY = translateY._value;

        // More responsive movement detection - lower velocity threshold
        let finalY;
        if (Math.abs(gestureState.vy) > 0.2) {
          // Direction based on velocity for more natural feel
          finalY = gestureState.vy > 0 ? maxTranslateY : minTranslateY;
          console.log('Flick detected, going to:', finalY === minTranslateY ? 'expanded' : 'collapsed');
        } else {
          // Position-based snapping with closer midpoint to bottom for more natural feel
          const snapThreshold = minTranslateY + ((maxTranslateY - minTranslateY) * 0.4);
          finalY = currentY < snapThreshold ? minTranslateY : maxTranslateY;
          console.log('Drag detected, snapping to:', finalY === minTranslateY ? 'expanded' : 'collapsed');
        }

        // Ensure we're within bounds
        finalY = Math.max(minTranslateY, Math.min(finalY, maxTranslateY));

        console.log('Animation starting - from:', currentY, 'to:', finalY);

        Animated.spring(translateY, {
          toValue: finalY,
          ...ANIMATION_CONFIG,
          // Faster spring for more responsive feel
          tension: 50,
          friction: 7,
        }).start(() => {
          lastOffsetY.current = finalY;
          console.log('Animation completed - final height:', maxHeight - finalY);
        });
      }
    })
  ).current;

  // Handle header drag area specifically for better touch response
  const headerPanHandlers = panResponder.panHandlers;

  return (
    <View>
      <Animated.View
        style={[
          { bottom: 0, position: 'absolute', left: 0, right: 0 },
          sheetStyle,
          {
            transform: [{ translateY }],
            opacity: isReady ? 1 : 0
          }
        ]}
      >
        {/* Render the custom header content with pan handlers */}
        {React.cloneElement(headerContent, { ...headerPanHandlers })}

        <ScrollView
          ref={scrollViewRef}
          style={[
            scrollContainerStyle,
            { maxHeight: scrollMaxHeight }
          ]}
          contentContainerStyle={[
            contentContainerStyle
          ]}
          showsVerticalScrollIndicator={showVerticalScrollIndicator}
          scrollEventThrottle={16}
          bounces={false}
          onScrollBeginDrag={() => console.log('Scroll started inside content')}
        >
          {children}
        </ScrollView>
      </Animated.View>
    </View>

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
}) => {

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
  console.log("calculatedFooterHeight", calculatedFooterHeight);
  const calculatedMaxHeightForScrollView = scrollMaxHeight ?? (SCREEN_HEIGHT - STATUS_BAR_HEIGHT - calculatedFooterHeight - 30);
  console.log(`(${SCREEN_HEIGHT}, ${STATUS_BAR_HEIGHT}, ${calculatedFooterHeight} )calculatedMaxHeightForScrollView: `, calculatedMaxHeightForScrollView);
  return (
    <BottomSheetCard
      initialPosition={initialPosition}
      sheetStyle={sheetStyle}
      scrollContainerStyle={scrollContainerStyle}
      scrollMaxHeight={calculatedMaxHeightForScrollView}
      contentContainerStyle={contentContainerStyle}
      headerContent={headerContent}
      minHeight={headerHeight}
      showVerticalScrollIndicator={showVerticalScrollIndicator}>
      {children}
    </BottomSheetCard>
  );
};



export default ExpandableBottomSheetCard;


