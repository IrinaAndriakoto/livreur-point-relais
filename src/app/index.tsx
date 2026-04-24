import { Link } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AnimatedIcon } from "@/components/animated-icon";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { BottomTabInset, MaxContentWidth, Spacing } from "@/constants/theme";
import {
  getDashboardTransactions,
  type Transaction,
} from "@/lib/delivery-data";

export default function HomeScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, [loadTransactions]),
  );

  const stats = useMemo(() => {
    const pending = transactions.filter(
      (transaction) => transaction.status === "pending",
    ).length;
    const assigned = transactions.filter(
      (transaction) => transaction.status === "assigned",
    ).length;
    const delivered = transactions.filter(
      (transaction) => transaction.status === "delivered",
    ).length;

    return [
      { label: "En attente", value: pending, accent: "#E88A1D" },
      { label: "Assignees", value: assigned, accent: "#208AEF" },
      { label: "Livrees", value: delivered, accent: "#1F9D61" },
    ];
  }, [transactions]);

  const renderTransactionsTable = () => {
    if (isLoading) {
      return (
        <View style={styles.tableState}>
          <ActivityIndicator size="large" />
          <ThemedText style={styles.tableStateText}>Chargement...</ThemedText>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.tableState}>
          <ThemedText type="defaultSemiBold" style={styles.errorText}>
            Erreur
          </ThemedText>
          <ThemedText style={styles.tableStateText}>{error}</ThemedText>
          <TouchableOpacity style={styles.retryButton} onPress={loadTransactions}>
            <ThemedText style={styles.retryButtonText}>Reessayer</ThemedText>
          </TouchableOpacity>
        </View>
      );
    }

    if (transactions.length === 0) {
      return (
        <View style={styles.tableState}>
          <ThemedText style={styles.tableStateText}>
            Aucune transaction pour le moment
          </ThemedText>
        </View>
      );
    }

    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <ThemedText type="defaultSemiBold" style={styles.idColumn}>
              ID
            </ThemedText>
            <ThemedText type="defaultSemiBold" style={styles.insurerColumn}>
              Assureur
            </ThemedText>
            <ThemedText type="defaultSemiBold" style={styles.relayColumn}>
              Point relais
            </ThemedText>
            <ThemedText type="defaultSemiBold" style={styles.windowColumn}>
              Creneau
            </ThemedText>
          </View>

          {transactions.map((transaction) => (
            <View key={transaction.id} style={styles.tableRow}>
              <ThemedText style={styles.idColumn}>{transaction.id}</ThemedText>
              <ThemedText style={styles.insurerColumn}>
                {transaction.insurerName}
              </ThemedText>
              <ThemedText style={styles.relayColumn}>
                {transaction.relayName}
              </ThemedText>
              <ThemedText style={styles.windowColumn}>
                {transaction.scheduledWindow}
              </ThemedText>
            </View>
          ))}
        </View>
      </ScrollView>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.heroSection}>
          <View style={styles.heroBadge}>
            <ThemedText type="smallBold" style={styles.heroBadgeText}>
              Tableau de bord logistique
            </ThemedText>
          </View>

          <AnimatedIcon />

          <View style={styles.heroCopy}>
            <ThemedText type="title" style={styles.title}>
              Livreur Point Relais
            </ThemedText>
            <ThemedText style={styles.heroDescription}>
              Une page d'accueil claire pour piloter les remises, visualiser les
              points relais et brancher vos futurs appels backend sans refaire
              l'interface.
            </ThemedText>
          </View>

          <View style={styles.ctaRow}>
            <Link href="/maps" asChild>
              <TouchableOpacity style={styles.primaryButton}>
                <ThemedText style={styles.primaryButtonText}>
                  Ouvrir la carte OSM
                </ThemedText>
              </TouchableOpacity>
            </Link>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={loadTransactions}
            >
              <ThemedText type="defaultSemiBold">Actualiser</ThemedText>
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

        <ThemedView style={styles.transactionsSection}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Tournees du jour
            </ThemedText>
            <ThemedText style={styles.sectionDescription}>
              Les donnees passent deja par une couche de service. Vous pourrez y
              brancher ensuite vos vraies methodes backend.
            </ThemedText>
          </View>
          <ThemedView style={styles.tableContainer}>
            {renderTransactionsTable()}
          </ThemedView>
        </ThemedView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    flexDirection: "row",
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
    backgroundColor: "#EAF5FF",
  },
  heroBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#D5EBFF",
  },
  heroBadgeText: {
    color: "#14578D",
  },
  heroCopy: {
    gap: Spacing.two,
  },
  title: {
    textAlign: "left",
  },
  heroDescription: {
    maxWidth: 620,
    color: "#365B77",
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
    backgroundColor: "#208AEF",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  secondaryButton: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#9AC8F1",
    backgroundColor: "#FFFFFF",
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
  transactionsSection: {
    flex: 1,
    gap: Spacing.two,
  },
  sectionHeader: {
    paddingHorizontal: Spacing.two,
    gap: Spacing.one,
  },
  sectionTitle: {
    paddingHorizontal: 0,
  },
  sectionDescription: {
    opacity: 0.7,
  },
  tableContainer: {
    flex: 1,
    borderWidth: 1,
    borderRadius: Spacing.three,
    overflow: "hidden",
    borderColor: "rgba(32, 138, 239, 0.15)",
  },
  table: {
    minWidth: 820,
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  tableHeader: {
    backgroundColor: "rgba(59, 130, 246, 0.08)",
    borderBottomWidth: 2,
  },
  idColumn: {
    width: 120,
  },
  insurerColumn: {
    width: 140,
  },
  relayColumn: {
    width: 240,
  },
  windowColumn: {
    width: 220,
  },
  tableState: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    flex: 1,
  },
  tableStateText: {
    textAlign: "center",
    opacity: 0.7,
  },
  errorText: {
    textAlign: "center",
    color: "#e74c3c",
  },
  retryButton: {
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#3b82f6",
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});
