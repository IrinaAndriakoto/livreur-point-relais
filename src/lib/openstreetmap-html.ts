import type { RelayPoint } from "@/lib/delivery-data";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getMapCenter(points: RelayPoint[]) {
  if (points.length === 0) {
    return {
      latitude: 48.8566,
      longitude: 2.3522,
      zoom: 5,
    };
  }

  const totals = points.reduce(
    (accumulator, point) => ({
      latitude: accumulator.latitude + point.latitude,
      longitude: accumulator.longitude + point.longitude,
    }),
    { latitude: 0, longitude: 0 },
  );

  return {
    latitude: totals.latitude / points.length,
    longitude: totals.longitude / points.length,
    zoom: points.length === 1 ? 13 : 6,
  };
}

export function buildOpenStreetMapHtml(points: RelayPoint[]) {
  const center = getMapCenter(points);
  const markers = points
    .map(
      (point) => `
        L.marker([${point.latitude}, ${point.longitude}]).addTo(map)
          .bindPopup(
            "<strong>${escapeHtml(point.name)}</strong><br/>Assureur: ${escapeHtml(point.insurerName)}<br/>Contrat: ${escapeHtml(point.contractRef)}}"
          );
      `,
    )
    .join("\n");

  return `
    <!DOCTYPE html>
    <html lang="fr">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossorigin=""
        />
        <style>
          html, body, #map {
            height: 100%;
            margin: 0;
          }

          body {
            font-family: Arial, sans-serif;
            background: #eef4f8;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script
          src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
          integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
          crossorigin=""
        ></script>
        <script>
          const map = L.map("map", {
            zoomControl: true,
            scrollWheelZoom: true,
          }).setView([${center.latitude}, ${center.longitude}], ${center.zoom});

          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap contributors'
          }).addTo(map);

          ${markers}
        </script>
      </body>
    </html>
  `;
}
