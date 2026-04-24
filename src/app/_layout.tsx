import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Tabs } from "expo-router";
import React from "react";
import { Image, useColorScheme } from "react-native";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
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
          tabBarActiveTintColor: "#208AEF",
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
              <Image
                source={require("@/assets/images/tabIcons/home.png")}
                style={{ tintColor: color, width: 22, height: 22 }}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="maps"
          options={{
            title: "Carte",
            tabBarIcon: ({ color }) => (
              <Image
                source={require("@/assets/images/tabIcons/explore.png")}
                style={{ tintColor: color, width: 22, height: 22 }}
              />
            ),
          }}
        />
      </Tabs>
    </ThemeProvider>
  );
}
