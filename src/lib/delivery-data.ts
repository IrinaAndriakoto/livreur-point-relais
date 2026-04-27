export type DeliveryStatus = "pret_aro" | "enleve_livreur" | "remis";

export type Transaction = {
  idTransaction: number;
  idInterne: string;
  nomAssureur: string;
  refContrat: string;
  nomAssure: string;
  // livraison: string;
  pointRelais: string;
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
};

const rawApiUrl = (process.env.EXPO_PUBLIC_API_URL ?? "").trim().replace(/\/+$/, "");
const apiUrl = rawApiUrl?.endsWith("/getPret")
  ? rawApiUrl
  : `${rawApiUrl}/getPret`;

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

  if (value.startsWith("enleve_livreur") ) {
    return "enleve_livreur";
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
        pointRelais: normalizeString(source.pointRelais, "Non renseigne"),
        dispatchStatus: normalizeStatus(source.dispatchStatus),
        dispatchStatusRaw: normalizeString(source.dispatchStatus, "pret_aro"),
        latitude: normalizeNumber(source.latitude),
        longitude: normalizeNumber(source.longitude),
      };
    })
    .filter((transaction): transaction is Transaction => transaction !== null);
}

// export function formatCurrency(value: number | null) {
//   if (value === null) {
//     return "-";
//   }

//   return new Intl.NumberFormat("fr-FR").format(value);
// }

// export function formatTransactionDate(value: string) {
//   if (!value) {
//     return "-";
//   }

//   const date = new Date(value);

//   if (Number.isNaN(date.getTime())) {
//     return value;
//   }

//   return new Intl.DateTimeFormat("fr-FR", {
//     dateStyle: "short",
//     timeStyle: "short",
//   }).format(date);
// }

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
    }));
}

export async function getDashboardTransactions(): Promise<Transaction[]> {
  if (!apiUrl) {
    throw new Error("EXPO_PUBLIC_API_URL n'est pas configure.");
  }

  console.log("Fetching transactions from API:", apiUrl);

  const response = await fetch(apiUrl, {
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

export async function getRelayPoints(): Promise<RelayPoint[]> {
  const transactions = await getDashboardTransactions();
  return mapTransactionsToRelayPoints(transactions);
}
