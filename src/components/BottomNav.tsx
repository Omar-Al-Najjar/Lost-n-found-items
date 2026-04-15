import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, Keyboard, Pressable, StyleSheet, View } from 'react-native';

import { Palette, TabKey } from '../types';

type BottomNavProps = {
  palette: Palette;
  tabs: Array<{ key: TabKey; icon: React.ComponentProps<typeof Ionicons>['name']; isCenter?: boolean }>;
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
};

export function BottomNav({ palette, tabs, activeTab, onSelectTab }: BottomNavProps) {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.08, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    );

    animation.start();
    return () => animation.stop();
  }, [pulse]);

  return (
    <View style={styles.wrap}>
      <View style={[styles.bar, { backgroundColor: palette.tabBar, borderColor: palette.border }]}>
        {tabs.map((tab) => {
          const isActive = tab.key === activeTab;
          return (
            <Pressable
              key={tab.key}
              style={[styles.tabButton, tab.isCenter && styles.centerTab]}
              onPress={() => {
                Keyboard.dismiss();
                onSelectTab(tab.key);
              }}
              hitSlop={10}
            >
              {isActive && !tab.isCenter && <View style={[styles.activeLine, { backgroundColor: palette.accent }]} />}
              <Animated.View
                style={[
                  styles.iconBubble,
                  {
                    backgroundColor: tab.isCenter
                      ? isActive
                        ? palette.accent
                        : palette.cardMuted
                      : isActive
                        ? palette.cardMuted
                        : 'transparent',
                  },
                  tab.isCenter && styles.centerIconBubble,
                  tab.isCenter && isActive && { transform: [{ scale: pulse }] },
                ]}
              >
                <Ionicons
                  name={tab.icon}
                  size={tab.isCenter ? 22 : 24}
                  color={tab.isCenter ? (isActive ? '#070706' : palette.textPrimary) : isActive ? palette.textPrimary : palette.navIcon}
                />
              </Animated.View>
            </Pressable>
          );
        })}
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
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  bar: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 28,
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 10,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 12,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    minHeight: 56,
  },
  centerTab: {
    marginTop: -18,
  },
  activeLine: {
    width: 28,
    height: 3,
    borderRadius: 999,
    marginBottom: 6,
  },
  iconBubble: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  centerIconBubble: {
    width: 60,
    height: 60,
    borderRadius: 999,
    shadowColor: '#9FBF2A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.26,
    shadowRadius: 18,
    elevation: 10,
  },
});
