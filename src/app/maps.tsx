import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { OpenStreetMapView } from "@/components/openstreetmap-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { BottomTabInset, MaxContentWidth, Spacing } from "@/constants/theme";
import { getRelayPoints, type RelayPoint } from "@/lib/delivery-data";

export default function MapsScreen() {
  const [relayPoints, setRelayPoints] = useState<RelayPoint[]>([]);

  useEffect(() => {
    getRelayPoints()
      .then(setRelayPoints)
      .catch((error) => {
        console.error("[MapsScreen] getRelayPoints", error);
      });
  }, []);

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
      <SafeAreaView style={styles.container}>
        <ThemedView style={styles.heroCard}>
          <ThemedText type="smallBold" style={styles.eyebrow}>
            OpenStreetMap
          </ThemedText>
          <ThemedText type="title" style={styles.title}>
            Carte des points relais
          </ThemedText>
          <ThemedText style={styles.description}>
            La carte est deja en place. Il ne vous restera qu'a remplacer la
            source de donnees par vos appels backend pour afficher les points
            relais reels.
          </ThemedText>
        </ThemedView>

        <ThemedView type="backgroundElement" style={styles.mapCard}>
          <OpenStreetMapView points={relayPoints} />
        </ThemedView>

        <View style={styles.listHeader}>
          <ThemedText type="subtitle">Points prepares</ThemedText>
          <ThemedText style={styles.description}>
            Chaque point ci-dessous est deja lie a la carte.
          </ThemedText>
        </View>

        <View style={styles.pointsGrid}>
          {relayPoints.map((point) => (
            <ThemedView key={point.id} type="backgroundElement" style={styles.pointCard}>
              <ThemedText type="defaultSemiBold">{point.name}</ThemedText>
              <ThemedText themeColor="textSecondary">
                {point.address}, {point.city}
              </ThemedText>
              <ThemedText style={styles.pointMeta}>
                {point.availablePackages} colis en attente
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
    backgroundColor: "#F3F8EC",
    gap: Spacing.two,
  },
  eyebrow: {
    color: "#507B23",
  },
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
  pointMeta: {
    color: "#208AEF",
  },
});
