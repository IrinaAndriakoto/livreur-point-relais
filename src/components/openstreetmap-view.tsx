import { StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";

import type { RelayPoint } from "@/lib/delivery-data";
import { buildOpenStreetMapHtml } from "@/lib/openstreetmap-html";

type OpenStreetMapViewProps = {
  points: RelayPoint[];
};

export function OpenStreetMapView({ points }: OpenStreetMapViewProps) {
  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={["*"]}
        source={{ html: buildOpenStreetMapHtml(points) }}
        style={styles.map}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 420,
    overflow: "hidden",
    borderRadius: 24,
  },
  map: {
    flex: 1,
    backgroundColor: "transparent",
  },
});
