import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Palette, TabKey } from '../types';

type BottomNavProps = {
  palette: Palette;
  tabs: Array<{ key: TabKey; icon: React.ComponentProps<typeof Ionicons>['name']; isCenter?: boolean }>;
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
};

export function BottomNav({ palette, tabs, activeTab, onSelectTab }: BottomNavProps) {
  return (
    <View style={styles.wrap}>
      <View style={[styles.bar, { backgroundColor: palette.tabBar }]}> 
        {tabs.map((tab) => {
          const isActive = tab.key === activeTab;
          return (
            <Pressable key={tab.key} style={[styles.tabButton, tab.isCenter && styles.centerTab]} onPress={() => onSelectTab(tab.key)}>
              {isActive && <View style={[styles.activeLine, { backgroundColor: palette.accent }]} />}
              <View
                style={[
                  styles.iconBubble,
                  { backgroundColor: tab.isCenter ? palette.cardMuted : 'transparent' },
                  tab.isCenter && styles.centerIconBubble,
                ]}
              >
                <Ionicons
                  name={tab.icon}
                  size={tab.isCenter ? 22 : 24}
                  color={isActive ? palette.textPrimary : palette.navIcon}
                />
              </View>
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
    flex: 1,
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
