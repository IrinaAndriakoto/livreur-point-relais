import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Tabs } from "expo-router";
import React from "react";
import { useColorScheme } from "react-native";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? "light"];

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: palette.accent,
          tabBarInactiveTintColor: palette.textSecondary,
          tabBarStyle: {
            backgroundColor: palette.background,
            borderTopColor: palette.backgroundSelected,
            height: 64,
            paddingBottom: 8,
            paddingTop: 8,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Accueil",
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="house.fill" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="attestations"
          options={{
            title: "Attestations",
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="doc.fill" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="maps"
          options={{
            title: "Carte",
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="map.fill" color={color} />
            ),
          }}
        />
      </Tabs>
    </ThemeProvider>
  );
}
