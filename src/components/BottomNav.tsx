import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';

import { Palette, TabKey } from '../types';

type TabConfig = {
  key: TabKey;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  isCenter?: boolean;
};

type BottomNavProps = {
  palette: Palette;
  tabs: TabConfig[];
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
};

type TabItemProps = {
  tab: TabConfig;
  index: number;
  palette: Palette;
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
};

function TabItem({ tab, index, palette, activeTab, onSelectTab }: TabItemProps) {
  const isActive = tab.key === activeTab;
  const selectedIconColor = '#000000';
  const getActiveIconName = () => {
    if (!isActive) return tab.icon;
    if (tab.key === 'home') return 'home';
    if (tab.key === 'posts') return 'briefcase';
    if (tab.key === 'chat') return 'chatbubble';
    if (tab.key === 'profile') return 'person';
    return tab.icon;
  };
  const appear = useRef(new Animated.Value(0)).current;
  const hoverScale = useRef(new Animated.Value(1)).current;
  const hoverLift = useRef(new Animated.Value(0)).current;
  const centerSpin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(appear, {
      toValue: 1,
      duration: 260,
      delay: index * 60,
      useNativeDriver: true,
    }).start();
  }, [appear, index]);

  const animateHoverIn = () => {
    Animated.parallel([
      Animated.spring(hoverScale, { toValue: 1.08, useNativeDriver: true, tension: 260, friction: 16 }),
      Animated.spring(hoverLift, { toValue: -2, useNativeDriver: true, tension: 260, friction: 16 }),
      Animated.timing(centerSpin, { toValue: tab.isCenter ? 1 : 0, duration: 180, useNativeDriver: true }),
    ]).start();
  };

  const animateHoverOut = () => {
    Animated.parallel([
      Animated.spring(hoverScale, { toValue: 1, useNativeDriver: true, tension: 260, friction: 16 }),
      Animated.spring(hoverLift, { toValue: 0, useNativeDriver: true, tension: 260, friction: 16 }),
      Animated.timing(centerSpin, { toValue: 0, duration: 180, useNativeDriver: true }),
    ]).start();
  };

  const appearY = appear.interpolate({
    inputRange: [0, 1],
    outputRange: [16, 0],
  });
  const centerRotate = centerSpin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg'],
  });

  return (
    <Animated.View
      style={{
        flex: 1,
        opacity: appear,
        transform: [{ translateY: appearY }, { translateY: hoverLift }, { scale: hoverScale }],
      }}
    >
      <Pressable
        style={[styles.tabButton, tab.isCenter && styles.centerTab]}
        onPress={() => onSelectTab(tab.key)}
        onHoverIn={animateHoverIn}
        onHoverOut={animateHoverOut}
        onPressIn={animateHoverIn}
        onPressOut={animateHoverOut}
      >
        {isActive && <View style={[styles.activeLine, { backgroundColor: palette.accent }]} />}
        <Animated.View
          style={[
            styles.iconBubble,
            { backgroundColor: tab.isCenter ? palette.cardMuted : 'transparent' },
            tab.isCenter && styles.centerIconBubble,
            tab.isCenter && { transform: [{ rotate: centerRotate }] },
          ]}
        >
          <Ionicons
            name={getActiveIconName()}
            size={tab.isCenter ? 22 : 24}
            color={isActive ? selectedIconColor : palette.navIcon}
          />
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

export function BottomNav({ palette, tabs, activeTab, onSelectTab }: BottomNavProps) {
  return (
    <View style={styles.wrap}>
      <View style={[styles.bar, { backgroundColor: palette.tabBar }]}>
        {tabs.map((tab, index) => (
          <TabItem key={tab.key} tab={tab} index={index} palette={palette} activeTab={activeTab} onSelectTab={onSelectTab} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 14,
    paddingBottom: 10,
  },
  bar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#d7dce5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    minHeight: 56,
  },
  centerTab: {
    marginTop: -10,
  },
  activeLine: {
    width: 28,
    height: 3,
    borderRadius: 999,
    marginBottom: 6,
  },
  iconBubble: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  centerIconBubble: {
    width: 47,
    height: 47,
    borderRadius: 999,
  },
});
