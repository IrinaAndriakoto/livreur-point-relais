import type { CSSProperties } from "react";
import { StyleSheet, View } from "react-native";

import type { RelayPoint } from "@/lib/delivery-data";
import { buildOpenStreetMapHtml } from "@/lib/openstreetmap-html";

type OpenStreetMapViewProps = {
  points: RelayPoint[];
};

export function OpenStreetMapView({ points }: OpenStreetMapViewProps) {
  return (
    <View style={styles.container}>
      <iframe
        srcDoc={buildOpenStreetMapHtml(points)}
        style={iframeStyle}
        title="Carte OpenStreetMap"
        loading="lazy"
      />
    </View>
  );
}

const iframeStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  border: "none",
};

const styles = StyleSheet.create({
  container: {
    minHeight: 420,
    overflow: "hidden",
    borderRadius: 24,
  },
});
