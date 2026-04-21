import { useEffect, useMemo, useRef } from 'react';
import { Animated } from 'react-native';

type UseProfilePageMotionOptions = {
  headerOffset?: number;
  itemOffset?: number;
  itemDelayMs?: number;
  maxItems?: number;
};

type ProfilePageMotion = {
  headerAnimatedStyle: {
    transform: [{ translateY: Animated.Value }];
  };
  getItemAnimatedStyle: (index: number) => {
    opacity: Animated.Value | number;
    transform: [{ translateY: Animated.Value | number }];
  };
};

export function useProfilePageMotion(options: UseProfilePageMotionOptions = {}): ProfilePageMotion {
  const headerOffset = options.headerOffset ?? -70;
  const itemOffset = options.itemOffset ?? 18;
  const itemDelayMs = options.itemDelayMs ?? 60;
  const maxItems = options.maxItems ?? 28;

  const headerY = useRef(new Animated.Value(headerOffset)).current;
  const itemOpacity = useMemo(() => Array.from({ length: maxItems }, () => new Animated.Value(0)), [maxItems]);
  const itemY = useMemo(() => Array.from({ length: maxItems }, () => new Animated.Value(itemOffset)), [itemOffset, maxItems]);

  useEffect(() => {
    headerY.setValue(headerOffset);
    itemOpacity.forEach((value) => value.setValue(0));
    itemY.forEach((value) => value.setValue(itemOffset));

    const animation = Animated.parallel([
      Animated.spring(headerY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 180,
        friction: 20,
      }),
      ...itemOpacity.map((opacity, index) =>
        Animated.sequence([
          Animated.delay(80 + index * itemDelayMs),
          Animated.parallel([
            Animated.timing(opacity, {
              toValue: 1,
              duration: 280,
              useNativeDriver: true,
            }),
            Animated.timing(itemY[index], {
              toValue: 0,
              duration: 280,
              useNativeDriver: true,
            }),
          ]),
        ])
      ),
    ]);

    animation.start();
    return () => {
      animation.stop();
    };
  }, [headerOffset, headerY, itemDelayMs, itemOffset, itemOpacity, itemY]);

  return {
    headerAnimatedStyle: { transform: [{ translateY: headerY }] },
    getItemAnimatedStyle: (index) => {
      if (index < 0 || index >= maxItems) {
        return { opacity: 1, transform: [{ translateY: 0 }] };
      }
      return {
        opacity: itemOpacity[index],
        transform: [{ translateY: itemY[index] }],
      };
    },
  };
}
