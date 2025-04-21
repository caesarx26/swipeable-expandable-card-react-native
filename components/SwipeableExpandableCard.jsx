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
  showVerticalScrollIndicator = true,
}) => {
  const [baseHeight, setBaseHeight] = useState(0);
  const [expandableHeight, setExpandableHeight] = useState(0);
  const [bottomHeight, setBottomHeight] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false); // Still used for logic, but not direct rendering of bottom content
  const [contentMeasured, setContentMeasured] = useState(false);
  const [pendingAnimation, setPendingAnimation] = useState(null);
  const [showBottomContent, setShowBottomContent] = useState(false); // State to control bottom content visibility

  const isExpandedRef = useRef(false);
  const isAnimatingRef = useRef(false);
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

    if (isAnimatingRef.current) {
      console.log("Animation already in progress, skipping new animation request");
      return;
    }

    callbackTriggeredRef.current = false;

    if (animationRef.current) {
      console.log("Stopping previous animation (shouldn't happen if isAnimatingRef is checked)");
      animationRef.current.stop();
    }

    isAnimatingRef.current = true;

    const totalContentHeight = getTotalContentHeight();
    const targetHeight = toExpanded
      ? Math.min(totalContentHeight, maxHeightForExpandableContent)
      : 0;

    console.log(`Starting animation from ${heightAnim._value} to ${targetHeight}, totalHeight=${totalContentHeight}`);

    // If expanding, show bottom content at the start of the animation
    if (toExpanded) {
      setShowBottomContent(true);
    }

    animationRef.current = Animated.timing(heightAnim, {
      toValue: targetHeight,
      duration: animationDuration,
      useNativeDriver: false,
    });

    animationRef.current.start((finished) => {
      console.log(`Animation ${finished ? 'completed' : 'interrupted'}`);
      isAnimatingRef.current = false;

      // If collapsing and animation finished, hide bottom content
      if (!toExpanded && finished) {
        setShowBottomContent(false);
      }

      if (finished && !callbackTriggeredRef.current) {
        callbackTriggeredRef.current = true;
        // Update isExpanded state ONLY after the animation finishes if collapsing
        // For expanding, setIsExpanded to true here or rely on the initial state
        // update in toggleExpansion, depending on preferred behavior.
        // Let's set it on completion for both for consistency.
        setIsExpanded(toExpanded);

        if (toExpanded && onExpansion) {
          console.log("Triggering onExpansion callback");
          onExpansion();
        } else if (!toExpanded && onCollapse) {
          console.log("Triggering onCollapse callback");
          onCollapse();
        }
      } else if (!finished && !toExpanded) {
        // If collapsing animation is interrupted, hide bottom content
        console.log("Collapse animation interrupted, hiding bottom content.");
        setShowBottomContent(false);
        setIsExpanded(false); // Also set state to false on interruption
      } else if (!finished && toExpanded) {
        // If expanding animation is interrupted, and height is not full, hide bottom content
        if (heightAnim._value < targetHeight) {
          console.log("Expand animation interrupted before completion, hiding bottom content.");
          setShowBottomContent(false);
          setIsExpanded(false); // Set state to false on interruption
        } else {
          // If animation interrupted near the end, might want to keep it shown
          console.log("Expand animation interrupted near completion, keeping bottom content shown.");
          setIsExpanded(true); // Set state to true on interruption if near end
        }
      }
    });
  };
  const overscrollDetectedRef = useRef(false);

  const toggleExpansion = (shouldExpand) => {
    console.log(`toggleExpansion called with shouldExpand=${shouldExpand}`);

    if (isAnimatingRef.current) {
      console.log("Animation in progress, ignoring toggle request.");
      return;
    }

    const newExpandedState = shouldExpand !== undefined ? shouldExpand : !isExpandedRef.current;

    console.log(`Current expanded state: ${isExpandedRef.current}, New state: ${newExpandedState}`);

    // Update the ref immediately for gesture logic
    isExpandedRef.current = newExpandedState;

    // Do NOT set the isExpanded state immediately here for collapsing (handled in animation callback)
    // For expanding, setting it here is fine, or you can do it in the animation callback too.
    // Let's set it via the callback for both for better synchronization with the animation.
    // setIsExpanded(newExpandedState);

    if (!newExpandedState) {
      overscrollDetectedRef.current = false;
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
      onStartShouldSetPanResponder: () => !isAnimatingRef.current,
      onMoveShouldSetPanResponder: (_, gestureState) => {
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

        if (isAnimatingRef.current) {
          console.log("Animation in progress, ignoring pan release.");
          gestureStateRef.current = { dy: 0 };
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
        gestureStateRef.current = { dy: 0 };
      }
    })
  ).current;

  const handleTap = () => {
    console.log("Tap handler called");

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


  const lastYRef = useRef(0);

  const handleScroll = (event) => {
    const currentY = event.nativeEvent.contentOffset.y;

    // Update scroll direction
    if (currentY > lastYRef.current) {
      // Scrolling down
      console.log("Scrolling down — reset overscroll flag");
      overscrollDetectedRef.current = false;
    }

    lastYRef.current = currentY;
  };

  const handleScrollEndDrag = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const lastY = lastYRef.current;

    // Detect if user is starting to scroll down
    if (offsetY > lastY) {
      console.log("Initial scroll direction is down — ignoring");
      overscrollDetectedRef.current = false;
      return;
    }

    if (offsetY <= 0) {
      if (overscrollDetectedRef.current) {
        console.log("Second upward drag at top detected — TRIGGER COLLAPSE");
        toggleExpansion(false);
        overscrollDetectedRef.current = false;
      } else {
        console.log("First upward drag at top — set flag");
        overscrollDetectedRef.current = true;
      }
    }
  };


  // Use showBottomContent state to control render
  const renderBottomContent = bottomContent && showBottomContent;

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
          // This height is controlled by the animation
          height: heightAnim,
          overflow: 'hidden',
          opacity: contentMeasured ? 1 : 0,
        }}
      >
        <TouchableWithoutFeedback>


          {needsScrollView ? (
            <ScrollView
              ref={scrollViewRef}
              bounces={true}
              showsVerticalScrollIndicator={showVerticalScrollIndicator}
              style={{ maxHeight: maxHeightForExpandableContent }}
              contentContainerStyle={{ paddingBottom: 10 }}
              onScroll={handleScroll}
              onScrollEndDrag={handleScrollEndDrag}
              scrollEventThrottle={16}
            >
              {expandableContent}
            </ScrollView>
          ) : (
            <TouchableWithoutFeedback onPress={handleTap}>
              <View>{expandableContent}</View>
            </TouchableWithoutFeedback>
          )}
        </TouchableWithoutFeedback>
      </Animated.View>

      {/* Bottom Section */}
      {renderBottomContent && (
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
