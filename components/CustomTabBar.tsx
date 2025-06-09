import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';

const TAB_WIDTH = 70; // Adjust based on your design for each tab's visual width
const CURVE_WIDTH = 120; // Width of the curve itself
const CIRCLE_SIZE = 60;
const ICON_SIZE = 26;

const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const activeTabX = useSharedValue(0);

  // Calculate initial position of the active tab for the animation
  React.useEffect(() => {
    activeTabX.value = withSpring(state.index * TAB_WIDTH + (TAB_WIDTH / 2) - (CURVE_WIDTH / 2));
  }, [state.index, activeTabX]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: activeTabX.value }],
    };
  });

  const renderIcon = (routeName: string, isFocused: boolean) => {
    const iconColor = isFocused ? '#fff' : '#6B7280';
    const fontSize = ICON_SIZE;
    switch (routeName) {
      case 'Home': return <Text style={{ fontSize, color: iconColor }}>🏠</Text>;
      case 'Deposit': return <Text style={{ fontSize, color: iconColor }}>💵</Text>;
      case 'Transfer': return <Text style={{ fontSize, color: iconColor }}>🔄</Text>;
      case 'Notification': return <Text style={{ fontSize, color: iconColor }}>🔔</Text>;
      case 'Setting': return <Text style={{ fontSize, color: iconColor }}>⚙️</Text>;
      default: return <Text style={{ fontSize, color: iconColor }}>?</Text>;
    }
  };

  const tabWidth = state.routes.length > 0 ? (state.routes.length * TAB_WIDTH) : 0;
  const height = 70; // Total height of the tab bar
  const curveStart = (TAB_WIDTH / 2) - (CURVE_WIDTH / 2);

  return (
    <View style={styles.tabBarContainer}>
      <Svg width={tabWidth} height={height} style={StyleSheet.absoluteFill}>
        <Path
          d={`M0,0 H${curveStart} C${curveStart + 20},0 ${curveStart + 35},20 ${curveStart + 50},35
             C${curveStart + 65},50 ${curveStart + 80},50 ${curveStart + 100},35
             C${curveStart + 115},20 ${curveStart + 130},0 ${tabWidth},0 V${height} H0 Z`}
          fill="#fff"
        />
      </Svg>

      <Animated.View style={[styles.activeCircleContainer, animatedStyle]}>
        <View style={styles.activeCircle}>
          {renderIcon(state.routes[state.index].name, true)}
        </View>
      </Animated.View>

      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name as any);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        // Position calculation for each tab button
        const tabButtonStyle = {
          width: TAB_WIDTH,
          height: height,
          justifyContent: 'center',
          alignItems: 'center',
        };

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={tabButtonStyle}
          >
            {!isFocused && renderIcon(route.name, isFocused)}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    backgroundColor: 'transparent', // The SVG will provide the background
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 8,
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    paddingBottom: 5,
  },
  activeCircleContainer: {
    position: 'absolute',
    bottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: CURVE_WIDTH, // Match the width of the curve for centering
  },
  activeCircle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: '#1E40AF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default CustomTabBar; 