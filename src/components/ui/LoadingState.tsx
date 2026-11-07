import React, { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Image,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { useTheme } from "@/constants/useTheme";

/**
 * Full-screen animated loader used during initial SQLite migration & seeding
 */
export const AppStartupLoader = ({
  message = "Menyiapkan database keuanganmu...",
}: {
  message?: string;
}) => {
  const { theme, isDark } = useTheme();
  const pulseAnim = useRef(new Animated.Value(0.92)).current;
  const barAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 850,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.92,
          duration: 850,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    const barLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(barAnim, {
          toValue: 1,
          duration: 1100,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(barAnim, {
          toValue: 0,
          duration: 1100,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );

    pulseLoop.start();
    barLoop.start();

    return () => {
      pulseLoop.stop();
      barLoop.stop();
    };
  }, [pulseAnim, barAnim]);

  const translateX = barAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-70, 70],
  });

  return (
    <View style={[styles.startupRoot, { backgroundColor: theme.background }]}>
      <Animated.View
        style={[
          styles.logoContainer,
          {
            backgroundColor: isDark ? "#111827" : "#FFFFFF",
            borderColor: theme.border,
            transform: [{ scale: pulseAnim }],
          },
        ]}
      >
        <Image
          source={require("../../assets/image.png")}
          style={styles.startupLogo}
        />
      </Animated.View>

      <Text style={[styles.startupBrand, { color: theme.text }]}>Duitku</Text>
      <Text style={[styles.startupSubtitle, { color: theme.textMuted }]}>
        {message}
      </Text>

      <View
        style={[
          styles.progressBarTrack,
          { backgroundColor: isDark ? "#182235" : "#E5E7EB" },
        ]}
      >
        <Animated.View
          style={[
            styles.progressBarThumb,
            {
              backgroundColor: theme.primary,
              transform: [{ translateX }],
            },
          ]}
        />
      </View>
    </View>
  );
};

/**
 * Animated pulsing skeleton block for cards/rows while SQLite queries are loading
 */
export const SkeletonBlock = ({
  height = 100,
  borderRadius = 22,
  style,
}: {
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}) => {
  const { theme, isDark } = useTheme();
  const opacity = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.9,
          duration: 750,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.45,
          duration: 750,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          height,
          borderRadius,
          backgroundColor: isDark ? "#121A2B" : "#E5E7EB",
          borderWidth: 1,
          borderColor: theme.border,
          opacity,
        },
        style,
      ]}
    />
  );
};

/**
 * List of skeleton rows inside a card container
 */
export const CardListSkeleton = ({
  rows = 4,
  label = "Memuat data...",
}: {
  rows?: number;
  label?: string;
}) => {
  const { theme, isDark } = useTheme();
  const cardBg = isDark ? "#0F1523" : theme.card;

  return (
    <View
      style={[
        styles.skeletonCard,
        { backgroundColor: cardBg, borderColor: theme.border },
      ]}
    >
      <View style={styles.skeletonHeaderRow}>
        <ActivityIndicator size='small' color={theme.primaryText} />
        <Text style={[styles.skeletonLabel, { color: theme.textMuted }]}>
          {label}
        </Text>
      </View>

      {Array.from({ length: rows }).map((_, idx) => (
        <View key={idx} style={styles.skeletonItemWrap}>
          <SkeletonBlock
            height={52}
            borderRadius={14}
            style={{ borderWidth: 0 }}
          />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  startupRoot: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  logoContainer: {
    width: 84,
    height: 84,
    borderRadius: 24,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
    elevation: 6,
    shadowColor: "#B4F000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  startupLogo: {
    width: 58,
    height: 58,
    borderRadius: 14,
  },
  startupBrand: {
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: -0.4,
  },
  startupSubtitle: {
    fontSize: 12,
    marginTop: 6,
    marginBottom: 22,
    textAlign: "center",
  },
  progressBarTrack: {
    width: 140,
    height: 6,
    borderRadius: 999,
    overflow: "hidden",
    justifyContent: "center",
  },
  progressBarThumb: {
    width: 68,
    height: "100%",
    borderRadius: 999,
  },
  skeletonCard: {
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    gap: 10,
    marginBottom: 16,
  },
  skeletonHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  skeletonLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  skeletonItemWrap: {
    width: "100%",
  },
});
