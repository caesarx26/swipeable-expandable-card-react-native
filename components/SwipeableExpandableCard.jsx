import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Animated,
  PanResponder,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';

const SwipeableExpandableCard = ({
  rootStyling = {},
  maxHeightForExpandableContent = 300,
  baseContent,
  expandableContent,
  bottomContent,
  onExpansion,
  onCollapse,
  animationDuration = 300,
}) => {
  const [baseHeight, setBaseHeight] = useState(0);
  const [expandableHeight, setExpandableHeight] = useState(0);
  const [bottomHeight, setBottomHeight] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [contentMeasured, setContentMeasured] = useState(false);
  const [overscrollDetected, setOverscrollDetected] = useState(false);
  const [pendingAnimation, setPendingAnimation] = useState(null);

  const isExpandedRef = useRef(false);
  const isAnimatingRef = useRef(false);
  const scrollViewRef = useRef(null);
  const heightAnim = useRef(new Animated.Value(0)).current;
  const animationRef = useRef(null);
  const callbackTriggeredRef = useRef(false);
  const gestureStateRef = useRef({ dy: 0 });
  const contentMeasuredRef = useRef(false);

  const swipeThreshold = 20; // Reduced threshold for better responsiveness

  // Compute total content height from the latest state values
  const getTotalContentHeight = () => {
    return expandableHeight + (bottomContent ? bottomHeight : 0);
  };

  // Track how many measurements we've completed
  const measurementCount = useRef(0);
  const checkAllMeasurementsComplete = () => {
    measurementCount.current++;
    const expectedMeasurements = bottomContent ? 3 : 2;

    if (measurementCount.current >= expectedMeasurements && !contentMeasuredRef.current) {
      console.log("All measurements complete - setting contentMeasured=true");
      contentMeasuredRef.current = true;
      setContentMeasured(true);
    }
  };

  // Animation function that doesn't depend on state updates
  const runAnimation = (toExpanded) => {
    console.log(`Running animation to ${toExpanded ? 'expand' : 'collapse'}`);

    if (isAnimatingRef.current) {
      console.log("Animation already in progress, skipping");
      return;
    }

    callbackTriggeredRef.current = false;

    if (animationRef.current) {
      console.log("Stopping previous animation");
      animationRef.current.stop();
    }

    isAnimatingRef.current = true;

    const totalContentHeight = getTotalContentHeight();
    const targetHeight = toExpanded
      ? Math.min(totalContentHeight, maxHeightForExpandableContent)
      : 0;

    console.log(`Animating from ${heightAnim._value} to ${targetHeight}, totalHeight=${totalContentHeight}`);

    animationRef.current = Animated.timing(heightAnim, {
      toValue: targetHeight,
      duration: animationDuration,
      useNativeDriver: false,
    });

    animationRef.current.start((finished) => {
      isAnimatingRef.current = false;
      console.log(`Animation ${finished ? 'completed' : 'interrupted'}`);

      if (finished && !callbackTriggeredRef.current) {
        callbackTriggeredRef.current = true;
        if (toExpanded && onExpansion) {
          console.log("Triggering onExpansion callback");
          onExpansion();
        } else if (!toExpanded && onCollapse) {
          console.log("Triggering onCollapse callback");
          onCollapse();
        }
      }
    });
  };

  // Function to handle expansion/collapse
  const toggleExpansion = (shouldExpand) => {
    console.log(`toggleExpansion called with shouldExpand=${shouldExpand}`);

    const newExpandedState = shouldExpand !== undefined ? shouldExpand : !isExpandedRef.current;

    console.log(`Current expanded state: ${isExpandedRef.current}, New state: ${newExpandedState}`);

    isExpandedRef.current = newExpandedState;
    setIsExpanded(newExpandedState);

    if (!newExpandedState) {
      setOverscrollDetected(false);
    }

    // Always store the pending animation state. The useEffect will handle running it
    // once the content is measured.
    console.log("Setting pending animation state:", newExpandedState);
    setPendingAnimation(newExpandedState);
  };

  // Effect that runs when contentMeasured changes or pendingAnimation is set
  useEffect(() => {
    console.log(`useEffect for contentMeasured and pendingAnimation: contentMeasured=${contentMeasured}, pendingAnimation=${pendingAnimation}`);
    if (contentMeasured && pendingAnimation !== null) {
      console.log(`contentMeasured is true and pendingAnimation is set. Running animation for expansion: ${pendingAnimation}`);
      runAnimation(pendingAnimation);
      setPendingAnimation(null); // Clear the pending animation
    }
  }, [contentMeasured, pendingAnimation]); // Add pendingAnimation as a dependency

  // This panResponder handles swipe gestures on the base content
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        const shouldRespond = Math.abs(gestureState.dy) > Math.abs(gestureState.dx) &&
          Math.abs(gestureState.dy) > 5;

        console.log(`Move should set responder: ${shouldRespond}, dy: ${gestureState.dy}, dx: ${gestureState.dx}`);
        return shouldRespond;
      },
      onPanResponderGrant: () => {
        console.log("Pan responder granted");
        gestureStateRef.current = { dy: 0 };
      },
      onPanResponderMove: (_, gestureState) => {
        gestureStateRef.current = gestureState;

        if (Math.abs(gestureState.dy) > 10) {
          console.log(`Pan moving: dy=${gestureState.dy}`);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        console.log(`Pan released: dy=${gestureState.dy}, threshold=${swipeThreshold}`);

        if (gestureState.dy < -swipeThreshold && !isExpandedRef.current) {
          console.log("Swipe up detected - expanding");
          toggleExpansion(true);
        }
        else if (gestureState.dy > swipeThreshold && isExpandedRef.current) {
          console.log("Swipe down detected - collapsing");
          toggleExpansion(false);
        } else {
          console.log("Small movement detected, may be a tap");
        }

        gestureStateRef.current = { dy: 0 };
      },
      onPanResponderTerminate: () => {
        console.log("Pan responder terminated");
        gestureStateRef.current = { dy: 0 };
      }
    })
  ).current;

  const handleTap = () => {
    console.log("Tap handler called");
    if (Math.abs(gestureStateRef.current.dy) < 10) {
      console.log("Tap detected - toggling state");
      toggleExpansion();
    } else {
      console.log(`Not a tap, dy=${gestureStateRef.current.dy}`);
    }
  };

  const handleScroll = (event) => {
    const { contentOffset } = event.nativeEvent;
    if (contentOffset.y > 0) {
      setOverscrollDetected(false);
    }
  };

  const handleScrollBeginDrag = (event) => {
    const { contentOffset } = event.nativeEvent;
    console.log(`Scroll begin drag: y=${contentOffset.y}`);
    if (contentOffset.y <= 0) {
      if (overscrollDetected) {
        console.log("Second overscroll detected - collapsing");
        toggleExpansion(false);
      } else {
        console.log("First overscroll detected - setting flag");
        setOverscrollDetected(true);
      }
    }
  };

  const needsScrollView = getTotalContentHeight() > maxHeightForExpandableContent;

  const containerStyle = Platform.OS === 'ios'
    ? { zIndex: 1 }
    : {};

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    measurementCount.current = 0;
    contentMeasuredRef.current = false;

    return () => {
      // Cleanup code if needed
    };
  }, []);

  return (
    <View style={[styles.root, rootStyling, containerStyle]}>
      {/* Hidden measurement views */}
      <View
        style={styles.hidden}
        onLayout={(e) => {
          const height = e.nativeEvent.layout.height;
          console.log(`Base content measured: ${height}px`);
          setBaseHeight(height);
          checkAllMeasurementsComplete();
        }}
      >
        {baseContent}
      </View>
      <View
        style={styles.hidden}
        onLayout={(e) => {
          const height = e.nativeEvent.layout.height;
          console.log(`Expandable content measured: ${height}px`);
          setExpandableHeight(height);
          checkAllMeasurementsComplete();
        }}
      >
        {expandableContent}
      </View>
      {bottomContent && (
        <View
          style={styles.hidden}
          onLayout={(e) => {
            const height = e.nativeEvent.layout.height;
            console.log(`Bottom content measured: ${height}px`);
            setBottomHeight(height);
            checkAllMeasurementsComplete();
          }}
        >
          {bottomContent}
        </View>
      )}

      {/* Base section: tap and swipe logic */}
      <View {...panResponder.panHandlers}>
        <TouchableWithoutFeedback onPress={handleTap}>
          <View>{baseContent}</View>
        </TouchableWithoutFeedback>
      </View>

      {/* Expandable Content Container */}
      <Animated.View
        style={{
          height: heightAnim,
          overflow: 'hidden',
          opacity: contentMeasured ? 1 : 0,
        }}
      >
        {needsScrollView ? (
          <ScrollView
            ref={scrollViewRef}
            bounces={true}
            showsVerticalScrollIndicator={true}
            style={{ maxHeight: maxHeightForExpandableContent }}
            contentContainerStyle={{ paddingBottom: 10 }}
            onScroll={handleScroll}
            onScrollBeginDrag={handleScrollBeginDrag}
            scrollEventThrottle={16}
          >
            {expandableContent}
          </ScrollView>
        ) : (
          <View>{expandableContent}</View>
        )}
      </Animated.View>

      {/* Bottom Section */}
      {isExpanded && bottomContent && (
        <View style={{ opacity: contentMeasured ? 1 : 0 }}>
          {bottomContent}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    overflow: 'hidden',
  },
  hidden: {
    position: 'absolute',
    zIndex: -1,
    opacity: 0,
    left: -9999,
    top: -9999,
  },
});

export default SwipeableExpandableCard;
