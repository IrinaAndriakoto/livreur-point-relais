import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import {
  BottomTabInset,
  Colors,
  MaxContentWidth,
  Spacing,
} from "@/constants/theme";
import {
  formatCurrency,
  getDashboardTransactions,
  type Transaction,
  updateTransactionDispatchStatus,
} from "@/lib/delivery-data";

export default function AttestationsScreen() {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? "light"];
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      console.error("[AttestationsPage] Erreur chargement transactions:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, [loadTransactions]),
  );

  const closeConfirmationModal = useCallback(async () => {
    setSelectedTransaction(null);
    await loadTransactions();
  }, [loadTransactions]);

  const cancelConfirmationModal = useCallback(() => {
    setSelectedTransaction(null);
  }, []);

  const confirmPickup = useCallback(async () => {
    if (!selectedTransaction) {
      return;
    }

    setIsSubmitting(true);

    try {
      await updateTransactionDispatchStatus(
        selectedTransaction.idInterne,
        "en_cours",
      );
      await closeConfirmationModal();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [closeConfirmationModal, selectedTransaction]);

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
          <ThemedText
            type="defaultSemiBold"
            style={{ color: palette.danger }}
          >
            Erreur
          </ThemedText>
          <ThemedText style={styles.tableStateText}>{error}</ThemedText>
          <TouchableOpacity
            style={[
              styles.retryButton,
              { backgroundColor: palette.primaryButtonBackground },
            ]}
            onPress={loadTransactions}
          >
            <ThemedText
              style={{ color: palette.primaryButtonText, fontWeight: "600" }}
            >
              Reessayer
            </ThemedText>
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
          <View
            style={[
              styles.tableRow,
              styles.tableHeader,
              { backgroundColor: palette.tableHeaderBackground },
            ]}
          >
            <ThemedText type="defaultSemiBold" style={styles.idColumn}>
              ID
            </ThemedText>
            <ThemedText type="defaultSemiBold" style={styles.insurerColumn}>
              Assureur
            </ThemedText>
            <ThemedText type="defaultSemiBold" style={styles.relayColumn}>
              Point relais
            </ThemedText>
            <ThemedText type="defaultSemiBold" style={styles.amountColumn}>
              Prime
            </ThemedText>
            <ThemedText type="defaultSemiBold" style={styles.actionColumn}>
              Action
            </ThemedText>
          </View>

          {transactions.map((transaction) => (
            <View
              key={String(transaction.idTransaction)}
              style={[
                styles.tableRow,
                { borderBottomColor: palette.tableRowBorder },
              ]}
            >
              <ThemedText style={styles.idColumn}>{transaction.idInterne}</ThemedText>
              <ThemedText style={styles.insurerColumn}>
                {transaction.nomAssureur}
              </ThemedText>
              <ThemedText style={styles.relayColumn}>
                {transaction.pointRelais}
              </ThemedText>
              <ThemedText style={styles.amountColumn}>
                {formatCurrency(5000)}
              </ThemedText>
              <View style={styles.actionColumn}>
                <TouchableOpacity
                  style={[
                    styles.primaryButton,
                    {
                      backgroundColor: palette.primaryButtonBackground,
                      borderColor: palette.primaryButtonBorder,
                    },
                  ]}
                  onPress={() => setSelectedTransaction(transaction)}
                >
                  <ThemedText
                    type="defaultSemiBold"
                    style={{ color: palette.primaryButtonText }}
                  >
                    Récupérée
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <SafeAreaView style={styles.safeArea}>
          <ThemedView style={styles.transactionsSection}>
            <View style={styles.sectionHeader}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Attestations disponibles
              </ThemedText>
              <ThemedText themeColor="textSecondary">
                Les attestations prêtes pour livraison sont affichées ici.
              </ThemedText>
            </View>
            <ThemedView
              style={[
                styles.tableContainer,
                { borderColor: palette.tableBorder },
              ]}
            >
              {renderTransactionsTable()}
            </ThemedView>
          </ThemedView>
        </SafeAreaView>
      </ScrollView>

      <Modal
        visible={selectedTransaction !== null}
        transparent
        animationType="fade"
        onRequestClose={cancelConfirmationModal}
      >
        <View style={styles.modalBackdrop}>
          <ThemedView
            type="backgroundElement"
            style={[
              styles.modalCard,
              {
                borderColor: palette.tableBorder,
                backgroundColor: palette.backgroundElement,
              },
            ]}
          >
            <ThemedText type="subtitle" style={styles.modalTitle}>
              Confirmer l'action
            </ThemedText>
            <ThemedText themeColor="textSecondary">
              Marquer la transaction {selectedTransaction?.idInterne} comme en cours ?
            </ThemedText>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[
                  styles.modalSecondaryButton,
                  {
                    backgroundColor: palette.secondaryButtonBackground,
                    borderColor: palette.secondaryButtonBorder,
                  },
                ]}
                onPress={cancelConfirmationModal}
                disabled={isSubmitting}
              >
                <ThemedText
                  type="defaultSemiBold"
                  style={{ color: palette.secondaryButtonText }}
                >
                  Annuler
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalPrimaryButton,
                  {
                    backgroundColor: palette.primaryButtonBackground,
                    borderColor: palette.primaryButtonBorder,
                  },
                ]}
                onPress={confirmPickup}
                disabled={isSubmitting}
              >
                <ThemedText
                  type="defaultSemiBold"
                  style={{ color: palette.primaryButtonText }}
                >
                  {isSubmitting ? "Validation..." : "Confirmer"}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </ThemedView>
        </View>
      </Modal>
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
  tableContainer: {
    flex: 1,
    borderWidth: 1,
    borderRadius: Spacing.three,
    overflow: "hidden",
  },
  table: {
    minWidth: 980,
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  tableHeader: {
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
  amountColumn: {
    width: 140,
  },
  actionColumn: {
    width: 140,
  },
  primaryButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: "center",
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
  retryButton: {
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: Spacing.four,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },
  modalCard: {
    borderRadius: Spacing.four,
    padding: Spacing.four,
    gap: Spacing.three,
    borderWidth: 1,
  },
  modalTitle: {
    fontSize: 24,
    lineHeight: 30,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    flexWrap: "wrap",
    gap: Spacing.two,
  },
  modalSecondaryButton: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1,
  },
  modalPrimaryButton: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1,
  },
});
