import { useFocusEffect } from "@react-navigation/native";
import { Link } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AnimatedIcon } from "@/components/animated-icon";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import {
  BottomTabInset,
  Colors,
  MaxContentWidth,
  Spacing,
} from "@/constants/theme";
import { getDashboardTransactions, getLivraisonsWithDetails, type LivraisonDetail, type Transaction } from "@/lib/delivery-data";

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? "light"];

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [livraisons, setLivraisons] = useState<LivraisonDetail[]>([]);

  const loadTransactions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getDashboardTransactions();
      setTransactions(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      setError(message);
      setTransactions([]);
      console.error("[HomePage] Erreur chargement transactions:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadLivraisons = useCallback(async () => {
    try {
      const data = await getLivraisonsWithDetails();
      setLivraisons(data);
    } catch (err) {
      setLivraisons([]);
      console.error("[HomePage] Erreur chargement livraisons:", err);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTransactions();
      loadLivraisons();
    }, [loadTransactions, loadLivraisons]),
  );

  const stats = useMemo(() => {
    const pending = transactions.filter(
      (transaction) => transaction.dispatchStatus === "pret_aro",
    ).length;
    const assigned = livraisons.filter(
      (livraison) => livraison.statutLivraison?.toLowerCase() === "en_cours",
    ).length;
    const delivered = livraisons.filter(
      (livraison) => {
        const s = livraison.statutLivraison?.toLowerCase();
        return s === "livré" || s === "livre";
      },
    ).length;

    return [
      { label: "En attente", value: pending, accent: palette.warning },
      { label: "Assignées", value: assigned, accent: palette.accent },
      { label: "Livrées", value: delivered, accent: palette.success },
    ];
  }, [palette.accent, palette.success, palette.warning, transactions, livraisons]);

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <SafeAreaView style={styles.safeArea}>
          <ThemedView
            style={[
              styles.heroSection,
              { backgroundColor: palette.heroBackground },
            ]}
          >
            <ThemedView
              style={[
                styles.heroBadge,
                { backgroundColor: palette.heroBadgeBackground },
              ]}
            >
              <ThemedText
                type="smallBold"
                style={[styles.heroBadgeText, { color: palette.heroBadgeText }]}
              >
                Tableau de bord logistique
              </ThemedText>
            </ThemedView>

            <AnimatedIcon />

            <View style={styles.heroCopy}>
              <ThemedText type="title" style={styles.title}>
                Livreur Point Relais
              </ThemedText>
              <ThemedText
                style={[
                  styles.heroDescription,
                  { color: palette.heroDescription },
                ]}
              >
                Suivi des remises et accès rapide aux écrans de travail.
              </ThemedText>
            </View>

            <View style={styles.ctaRow}>
                <TouchableOpacity
                  style={[
                    styles.primaryButton,
                    {
                      backgroundColor: palette.primaryButtonBackground,
                      borderColor: palette.primaryButtonBorder,
                    },
                  ]}
                >
                    <Link href="/maps" asChild>
                  <ThemedText
                    style={{color : "#FAF9F6"}}
                  >
                    Ouvrir la carte
                  </ThemedText>
              </Link>
                </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.secondaryButton,
                  {
                    backgroundColor: palette.secondaryButtonBackground,
                    borderColor: palette.secondaryButtonBorder,
                  },
                ]}
                onPress={() => { loadTransactions(); loadLivraisons(); }}
              >
                <ThemedText
                  type="defaultSemiBold"
                  style={{ color: palette.secondaryButtonText }}
                >
                  Actualiser
                </ThemedText>
              </TouchableOpacity>
            </View>
          </ThemedView>

          <View style={styles.statsGrid}>
            {stats.map((stat) => (
              <ThemedView
                key={stat.label}
                type="backgroundElement"
                style={styles.statCard}
              >
                <View
                  style={[styles.statAccent, { backgroundColor: stat.accent }]}
                />
                <ThemedText type="small" themeColor="textSecondary">
                  {stat.label}
                </ThemedText>
                <ThemedText type="subtitle">{String(stat.value)}</ThemedText>
              </ThemedView>
            ))}
          </View>

          {error ? (
            <ThemedView
              type="backgroundElement"
              style={[
                styles.feedbackCard,
                { borderColor: palette.tableBorder },
              ]}
            >
              <ThemedText
                type="defaultSemiBold"
                style={{ color: palette.danger }}
              >
                Erreur de chargement
              </ThemedText>
              <ThemedText themeColor="textSecondary">{error}</ThemedText>
            </ThemedView>
          ) : null}
        </SafeAreaView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    flexDirection: "row",
  },
  scrollView: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    alignItems: "stretch",
    gap: Spacing.three,
    paddingTop: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
    width: "100%",
  },
  heroSection: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.four,
    gap: Spacing.four,
    borderRadius: Spacing.five,
  },
  heroBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  heroBadgeText: {
    fontWeight: "600",
  },
  heroCopy: {
    gap: Spacing.two,
  },
  title: {
    textAlign: "left",
  },
  heroDescription: {
    maxWidth: 620,
  },
  ctaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
  },
  primaryButton: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1,
    minWidth: 156,
    alignItems: "center",
  },
  primaryButtonText: {
    fontWeight: "600",
  },
  secondaryButton: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.three,
  },
  statCard: {
    minWidth: 180,
    flexGrow: 1,
    padding: Spacing.three,
    borderRadius: Spacing.four,
    gap: Spacing.one,
  },
  statAccent: {
    width: 48,
    height: 4,
    borderRadius: 999,
  },
  feedbackCard: {
    padding: Spacing.three,
    borderRadius: Spacing.four,
    gap: Spacing.one,
    borderWidth: 1,
  },
});
