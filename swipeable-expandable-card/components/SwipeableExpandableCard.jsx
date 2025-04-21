import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Animated,
  PanResponder,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';

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
  const [contentMeasured, setContentMeasured] = useState(false);
  const isExpandedRef = useRef(false);
  const heightAnim = useRef(new Animated.Value(0)).current;

  const swipeThreshold = 30;
  const totalContentHeight = expandableHeight + (bottomContent ? bottomHeight : 0);

  // Track how many measurements we've completed
  const measurementCount = useRef(0);
  const checkAllMeasurementsComplete = () => {
    measurementCount.current++;
    const expectedMeasurements = bottomContent ? 3 : 2;
    if (measurementCount.current >= expectedMeasurements) {
      setContentMeasured(true);
    }
  };

  const setExpandedState = (value) => {
    isExpandedRef.current = value;
    setIsExpanded(value);
  };

  useEffect(() => {
    if (contentMeasured) {
      Animated.timing(heightAnim, {
        toValue: isExpanded
          ? Math.min(totalContentHeight, maxHeightForExpandableContent)
          : 0,
        duration: 300,
        useNativeDriver: false,
      }).start(() => {
        isExpanded ? onExpansion?.() : onCollapse?.();
      });
    }
  }, [isExpanded, totalContentHeight, maxHeightForExpandableContent, contentMeasured]);

  const gestureY = useRef(0);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 10;
      },
      onPanResponderMove: (_, gestureState) => {
        gestureY.current = gestureState.dy;

        if (gestureState.dy < -swipeThreshold && !isExpandedRef.current) {
          setExpandedState(true);
        } else if (gestureState.dy > swipeThreshold && isExpandedRef.current) {
          setExpandedState(false);
        }
      },
      onPanResponderRelease: () => {
        gestureY.current = 0;
      },
    })
  ).current;

  const handleTap = () => {
    if (Math.abs(gestureY.current) < 10) {
      setExpandedState(!isExpandedRef.current);
    }
  };

  const needsScrollView = totalContentHeight > maxHeightForExpandableContent;

  return (
    <View style={[styles.root, rootStyling]}>
      {/* Hidden measurement views */}
      <View
        style={styles.hidden}
        onLayout={(e) => {
          setBaseHeight(e.nativeEvent.layout.height);
          checkAllMeasurementsComplete();
        }}
      >
        {baseContent}
      </View>
      <View
        style={styles.hidden}
        onLayout={(e) => {
          setExpandableHeight(e.nativeEvent.layout.height);
          checkAllMeasurementsComplete();
        }}
      >
        {expandableContent}
      </View>
      {bottomContent && (
        <View
          style={styles.hidden}
          onLayout={(e) => {
            setBottomHeight(e.nativeEvent.layout.height);
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
          opacity: contentMeasured ? 1 : 0, // Only show when measured to prevent flashes
        }}
      >
        {needsScrollView ? (
          <ScrollView
            bounces={false}
            showsVerticalScrollIndicator={true}
            style={{ maxHeight: maxHeightForExpandableContent }}
            contentContainerStyle={{ paddingBottom: 10 }}
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
    left: -1000, // Move far off screen to ensure it doesn't affect layout
  },
});

export default SwipeableExpandableCard;