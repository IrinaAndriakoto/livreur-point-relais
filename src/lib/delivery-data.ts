export type DeliveryStatus = "pret_aro" | "enleve_livreur" | "en_cours" | "remis";

export type Transaction = {
  idTransaction: number;
  idInterne: string;
  nomAssureur: string;
  refContrat: string;
  nomAssure: string;
  pointRelais: string;
  montantPrime: number | null;
  dispatchStatus: DeliveryStatus;
  dispatchStatusRaw: string;
  latitude: number | null;
  longitude: number | null;
};

export type RelayPoint = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  insurerName: string;
  contractRef: string;
  insuredName: string;
};

export type LivraisonDetail = {
  idLivraison: number;
  idInterne: string;
  nomLivreur: string;
  prenomLivreur: string;
  numeroLivreur: string;
  refContrat: string;
  nomAssureur: string;
  pointRelais: string;
  dispatchStatus: string;
  contact: string | null;
  dateRecuperation: string | null;
  statutLivraison: string | null;
};

const baseUrl = (process.env.EXPO_PUBLIC_API_URL ?? "")
  .trim()
  .replace(/\/+$/, "");
const transactionsApiUrl = `${baseUrl}/api/v1/transactions/getPret`;
const livraisonApiUrl = `${baseUrl}/api/livraisons`;

function normalizeNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function normalizeString(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : fallback;
}

function normalizeStatus(status: unknown): DeliveryStatus {
  const value = normalizeString(status).toLowerCase();

  if (value.startsWith("pret")) {
    return "pret_aro";
  }

  if (value.startsWith("enleve_livreur")) {
    return "enleve_livreur";
  }

  if (value.startsWith("en_cours")) {
    return "en_cours";
  }

  if (value.startsWith("remis")) {
    return "remis";
  }

  return "pret_aro";
}

function normalizeTransactions(payload: unknown): Transaction[] {
  if (!Array.isArray(payload)) {
    throw new Error("Le backend n'a pas retourne une liste de transactions.");
  }

  return payload
    .map((item) => {
      if (typeof item !== "object" || item === null) {
        return null;
      }

      const source = item as Record<string, unknown>;

      return {
        idTransaction: normalizeNumber(source.idTransaction) ?? 0,
        idInterne: normalizeString(source.idInterne, "N/A"),
        nomAssureur: normalizeString(source.nomAssureur, "N/A"),
        refContrat: normalizeString(source.refContrat, "N/A"),
        nomAssure: normalizeString(source.nomAssure, "N/A"),
        pointRelais: normalizeString(source.pointRelais, "Non renseigne"),
        montantPrime: normalizeNumber(source.montantPrime),
        dispatchStatus: normalizeStatus(source.dispatchStatus),
        dispatchStatusRaw: normalizeString(source.dispatchStatus, "pret_aro"),
        latitude: normalizeNumber(source.latitude),
        longitude: normalizeNumber(source.longitude),
      };
    })
    .filter((transaction): transaction is Transaction => transaction !== null);
}

function normalizeLivraisons(payload: unknown): LivraisonDetail[] {
  if (!Array.isArray(payload)) {
    throw new Error("Le backend n'a pas retourné une liste de livraisons.");
  }

  return payload
    .map((item) => {
      if (typeof item !== "object" || item === null) return null;
      const s = item as Record<string, unknown>;

      return {
        idLivraison:    normalizeNumber(s.id_livraison) ?? 0,
        idInterne:      normalizeString(s.id_interne, "N/A"),
        nomLivreur:     normalizeString(s.nom_livreur, "N/A"),
        prenomLivreur:  normalizeString(s.prenom_livreur, "N/A"),
        numeroLivreur:  normalizeString(s.numero_livreur, "N/A"),
        refContrat:     normalizeString(s.ref_contrat, "N/A"),
        nomAssureur:    normalizeString(s.nom_assureur, "N/A"),
        pointRelais:    normalizeString(s.point_relais, "Non renseigné"),
        dispatchStatus: normalizeString(s.dispatch_status, "N/A"),
        contact:        typeof s.contact === "string" ? s.contact : null,
        dateRecuperation: typeof s.date_recuperation === "string"
          ? s.date_recuperation : null,
        statutLivraison: typeof s.statut_livraison === "string"
          ? s.statut_livraison : null,
      };
    })
    .filter((l): l is LivraisonDetail => l !== null);
}

export function formatCurrency(value: number | null) {
  if (value === null) {
    return "-";
  }

  return `${new Intl.NumberFormat("fr-FR").format(value)} Ar`;
}

export function mapTransactionsToRelayPoints(
  transactions: Transaction[],
): RelayPoint[] {
  return transactions
    .filter(
      (transaction) =>
        transaction.latitude !== null && transaction.longitude !== null,
    )
    .map((transaction) => ({
      id: String(transaction.idTransaction),
      name: transaction.pointRelais,
      latitude: transaction.latitude as number,
      longitude: transaction.longitude as number,
      insurerName: transaction.nomAssureur,
      contractRef: transaction.refContrat,
      insuredName: transaction.nomAssure,
    }));
}

export async function getDashboardTransactions(): Promise<Transaction[]> {
  if (!transactionsApiUrl) {
    throw new Error("EXPO_PUBLIC_API_URL n'est pas configure.");
  }

  const response = await fetch(transactionsApiUrl, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erreur ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  return normalizeTransactions(data);
}

export async function updateTransactionDispatchStatus(
  idInterne: string,
  status: DeliveryStatus,
): Promise<void> {
  if (!baseUrl) {
    throw new Error("EXPO_PUBLIC_API_URL n'est pas configure.");
  }

  const response = await fetch(
    `${baseUrl}/api/v1/transactions/${encodeURIComponent(idInterne)}/updateDispatch?status=${encodeURIComponent(status)}`,
    {
      method: "PUT",
      headers: {
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erreur ${response.status}: ${errorText}`);
  }
}

export async function getRelayPoints(): Promise<RelayPoint[]> {
  const transactions = await getDashboardTransactions();
  return mapTransactionsToRelayPoints(transactions);
}

export async function createLivraison(idInterne: string): Promise<void> {
  if (!baseUrl) {
    throw new Error("EXPO_PUBLIC_API_URL n'est pas configure.");
  }

  const response = await fetch(`${baseUrl}/api/livraisons/createLivraison`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id_livreur: 1,                            // fixe pour les tests
      id_interne: idInterne,                    // transaction sélectionnée
      date_recuperation: new Date().toISOString(), // date du clic
      date_remise: null,                        // livraison pas encore terminée
      statut_livraison: "en_cours",
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erreur ${response.status}: ${errorText}`);
  }
}

export async function getLivraisonsWithDetails(): Promise<LivraisonDetail[]> {
  if (!livraisonApiUrl) {
    throw new Error("EXPO_PUBLIC_API_URL n'est pas configure.");
  }

  const response = await fetch(`${livraisonApiUrl}/details`, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erreur ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  return normalizeLivraisons(data);
}
