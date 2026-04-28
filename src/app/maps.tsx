import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { OpenStreetMapView } from "@/components/openstreetmap-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import {
  BottomTabInset,
  Colors,
  MaxContentWidth,
  Spacing,
} from "@/constants/theme";
import { getRelayPoints, type RelayPoint } from "@/lib/delivery-data";

export default function MapsScreen() {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? "light"];
  const [relayPoints, setRelayPoints] = useState<RelayPoint[]>([]);

  useEffect(() => {
    getRelayPoints()
      .then(setRelayPoints)
      .catch((error) => {
        console.error("[MapsScreen] getRelayPoints", error);
      });
  }, []);

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.contentContainer}
    >
      <SafeAreaView style={styles.container}>
        <ThemedView
          style={[styles.heroCard, { backgroundColor: palette.mapHeroBackground }]}
        >
          <ThemedText
            type="smallBold"
            style={[styles.eyebrow, { color: palette.mapHeroEyebrow }]}
          >
            OpenStreetMap
          </ThemedText>
          <ThemedText type="title" style={styles.title}>
            Carte des points relais
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.description}>
            Cette carte montre directement les attestations geolocalisees a
            livrer.
          </ThemedText>
        </ThemedView>

        <ThemedView type="backgroundElement" style={styles.mapCard}>
          <OpenStreetMapView points={relayPoints} />
        </ThemedView>

        <View style={styles.listHeader}>
          <ThemedText type="subtitle">Points detectes</ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.description}>
            Chaque point ci-dessous vient d'une transaction avec latitude et
            longitude.
          </ThemedText>
        </View>

        <View style={styles.pointsGrid}>
          {relayPoints.map((point) => (
            <ThemedView
              key={point.id}
              type="backgroundElement"
              style={styles.pointCard}
            >
              <ThemedText type="defaultSemiBold">{point.name}</ThemedText>
              <ThemedText themeColor="textSecondary">
                {point.insurerName}
              </ThemedText>
              <ThemedText style={{ color: palette.accent }}>
                Contrat {point.contractRef}
              </ThemedText>
            </ThemedView>
          ))}
        </View>
      </SafeAreaView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  container: {
    maxWidth: MaxContentWidth,
    flexGrow: 1,
    width: "100%",
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.four,
    gap: Spacing.three,
  },
  heroCard: {
    borderRadius: Spacing.five,
    padding: Spacing.four,
    gap: Spacing.two,
  },
  eyebrow: {},
  title: {
    fontSize: 40,
    lineHeight: 44,
  },
  description: {
    opacity: 0.75,
  },
  mapCard: {
    padding: Spacing.two,
    borderRadius: Spacing.five,
  },
  listHeader: {
    gap: Spacing.one,
  },
  pointsGrid: {
    gap: Spacing.three,
  },
  pointCard: {
    borderRadius: Spacing.four,
    padding: Spacing.three,
    gap: Spacing.one,
  },
});
