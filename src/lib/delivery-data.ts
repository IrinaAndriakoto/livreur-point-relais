export type DeliveryStatus = "pending" | "assigned" | "delivered";

export type Transaction = {
  id: string;
  contractRef: string;
  insurerName: string;
  relayName: string;
  relayAddress: string;
  customerName: string;
  scheduledWindow: string;
  status: DeliveryStatus;
};

export type RelayPoint = {
  id: string;
  name: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  availablePackages: number;
};

const apiUrl = process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/+$/, "");

export const mockTransactions: Transaction[] = [
  {
    id: "TX-24001",
    contractRef: "CTR-AXA-1042",
    insurerName: "AXA",
    relayName: "Relay Saint-Lazare",
    relayAddress: "12 Rue d'Amsterdam, Paris",
    customerName: "Nadia B.",
    scheduledWindow: "Aujourd'hui 14:00 - 16:00",
    status: "pending",
  },
  {
    id: "TX-24002",
    contractRef: "CTR-MAAF-7781",
    insurerName: "MAAF",
    relayName: "Point Central Gare",
    relayAddress: "4 Place de la Gare, Lyon",
    customerName: "Karim T.",
    scheduledWindow: "Aujourd'hui 16:00 - 18:00",
    status: "assigned",
  },
  {
    id: "TX-24003",
    contractRef: "CTR-GMF-3309",
    insurerName: "GMF",
    relayName: "Relais Bellecour",
    relayAddress: "18 Rue de la Barre, Lyon",
    customerName: "Julie M.",
    scheduledWindow: "Demain 09:00 - 11:00",
    status: "delivered",
  },
];

export const mockRelayPoints: RelayPoint[] = [
  {
    id: "RP-001",
    name: "Relay Saint-Lazare",
    address: "12 Rue d'Amsterdam",
    city: "Paris",
    latitude: 48.8764,
    longitude: 2.3288,
    availablePackages: 8,
  },
  {
    id: "RP-002",
    name: "Point Central Gare",
    address: "4 Place de la Gare",
    city: "Lyon",
    latitude: 45.7607,
    longitude: 4.8599,
    availablePackages: 5,
  },
  {
    id: "RP-003",
    name: "Relais Bellecour",
    address: "18 Rue de la Barre",
    city: "Lyon",
    latitude: 45.7579,
    longitude: 4.832,
    availablePackages: 11,
  },
];

function normalizeTransactions(payload: unknown): Transaction[] {
  if (!Array.isArray(payload)) {
    return [];
  }

  return payload.map((item, index) => {
    const record = typeof item === "object" && item !== null ? item : {};
    const source = record as Record<string, unknown>;

    return {
      id: String(source.id ?? source.idInterne ?? `TX-${index + 1}`),
      contractRef: String(source.contractRef ?? source.refContrat ?? "A renseigner"),
      insurerName: String(source.insurerName ?? source.nomAssureur ?? "A renseigner"),
      relayName: String(source.relayName ?? source.point_relais ?? "Point relais"),
      relayAddress: String(source.relayAddress ?? source.adresse ?? "Adresse a renseigner"),
      customerName: String(source.customerName ?? source.nomClient ?? "Client"),
      scheduledWindow: String(source.scheduledWindow ?? source.creneau ?? "A planifier"),
      status: normalizeStatus(source.status),
    };
  });
}

function normalizeStatus(status: unknown): DeliveryStatus {
  switch (status) {
    case "assigned":
    case "delivered":
    case "pending":
      return status;
    default:
      return "pending";
  }
}

export async function getDashboardTransactions(): Promise<Transaction[]> {
  // TODO: remplacer par l'appel backend reel.
  if (apiUrl) {
    return mockTransactions;
  }

  // try {
  //   const response = await fetch(apiUrl, {
  //     headers: {
  //       Accept: "application/json",
  //     },
  //   });

  //   if (!response.ok) {
  //     throw new Error(`Erreur ${response.status}`);
  //   }

  //   const data = await response.json();
  //   const transactions = normalizeTransactions(data);

  //   return transactions.length > 0 ? transactions : mockTransactions;
  // } catch (error) {
  //   console.error("[delivery-data] getDashboardTransactions", error);
  //   return mockTransactions;
  // }
}

export async function getRelayPoints(): Promise<RelayPoint[]> {
  // TODO: remplacer par votre endpoint de points relais.
  return mockRelayPoints;
}
