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
  const isAnimatingRef = useRef(false); // This is the key ref
  const scrollViewRef = useRef(null);
  const heightAnim = useRef(new Animated.Value(0)).current;
  const animationRef = useRef(null);
  const callbackTriggeredRef = useRef(false);
  const gestureStateRef = useRef({ dy: 0 });
  const contentMeasuredRef = useRef(false);

  const swipeThreshold = 20;

  const getTotalContentHeight = () => {
    return expandableHeight + (bottomContent ? bottomHeight : 0);
  };

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

  const runAnimation = (toExpanded) => {
    console.log(`Attempting to run animation to ${toExpanded ? 'expand' : 'collapse'}`);

    // Check if an animation is already in progress
    if (isAnimatingRef.current) {
      console.log("Animation already in progress, skipping new animation request");
      return; // Do not start a new animation if one is running
    }

    callbackTriggeredRef.current = false;

    if (animationRef.current) {
      console.log("Stopping previous animation (shouldn't happen if isAnimatingRef is checked)");
      animationRef.current.stop(); // Still good practice to stop in case
    }

    isAnimatingRef.current = true; // Set the flag when animation starts

    const totalContentHeight = getTotalContentHeight();
    const targetHeight = toExpanded
      ? Math.min(totalContentHeight, maxHeightForExpandableContent)
      : 0;

    console.log(`Starting animation from ${heightAnim._value} to ${targetHeight}, totalHeight=${totalContentHeight}`);

    animationRef.current = Animated.timing(heightAnim, {
      toValue: targetHeight,
      duration: animationDuration,
      useNativeDriver: false,
    });

    animationRef.current.start((finished) => {
      console.log(`Animation ${finished ? 'completed' : 'interrupted'}`);
      isAnimatingRef.current = false; // Unset the flag when animation finishes or is interrupted

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

  const toggleExpansion = (shouldExpand) => {
    console.log(`toggleExpansion called with shouldExpand=${shouldExpand}`);

    // Prevent toggling if an animation is currently running
    if (isAnimatingRef.current) {
      console.log("Animation in progress, ignoring toggle request.");
      return;
    }

    const newExpandedState = shouldExpand !== undefined ? shouldExpand : !isExpandedRef.current;

    console.log(`Current expanded state: ${isExpandedRef.current}, New state: ${newExpandedState}`);

    isExpandedRef.current = newExpandedState;
    setIsExpanded(newExpandedState);

    if (!newExpandedState) {
      setOverscrollDetected(false);
    }

    console.log("Setting pending animation state:", newExpandedState);
    setPendingAnimation(newExpandedState);
  };

  useEffect(() => {
    console.log(`useEffect for contentMeasured and pendingAnimation: contentMeasured=${contentMeasured}, pendingAnimation=${pendingAnimation}`);
    if (contentMeasured && pendingAnimation !== null && !isAnimatingRef.current) {
      console.log(`contentMeasured is true, pendingAnimation is set, and not animating. Running animation for expansion: ${pendingAnimation}`);
      runAnimation(pendingAnimation);
      setPendingAnimation(null);
    } else if (isAnimatingRef.current) {
      console.log("useEffect triggered but animation is already running.");
    }
  }, [contentMeasured, pendingAnimation]);

  const panResponder = useRef(
    PanResponder.create({
      // Do not set responder if animating
      onStartShouldSetPanResponder: () => !isAnimatingRef.current,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Do not set responder if animating
        if (isAnimatingRef.current) {
          return false;
        }

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
        // If animation started during the move, we should stop processing
        if (isAnimatingRef.current) {
          return;
        }
        gestureStateRef.current = gestureState;

        if (Math.abs(gestureState.dy) > 10) {
          console.log(`Pan moving: dy=${gestureState.dy}`);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        console.log(`Pan released: dy=${gestureState.dy}, threshold=${swipeThreshold}`);

        // Only process release if not animating
        if (isAnimatingRef.current) {
          console.log("Animation in progress, ignoring pan release.");
          gestureStateRef.current = { dy: 0 }; // Reset gesture state
          return;
        }

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
        // Reset gesture state even if terminated
        gestureStateRef.current = { dy: 0 };
      }
    })
  ).current;

  const handleTap = () => {
    console.log("Tap handler called");

    // Prevent tap action if an animation is currently running
    if (isAnimatingRef.current) {
      console.log("Animation in progress, ignoring tap.");
      return;
    }

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

  // Prevent scroll drag action if an animation is currently running
  const handleScrollBeginDrag = (event) => {
    if (isAnimatingRef.current) {
      console.log("Animation in progress, ignoring scroll begin drag.");
      return;
    }

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
},);

export default SwipeableExpandableCard;
