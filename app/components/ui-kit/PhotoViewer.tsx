import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

import { getSignedUrl } from "@/lib/storage";
import { colors, fontSize, fontWeight, space } from "@/lib/theme";

type Props = {
  bucket: "photos" | "documents" | "reports";
  storagePath: string | null;
  visible: boolean;
  onClose: () => void;
};

export function PhotoViewer({ bucket, storagePath, visible, onClose }: Props) {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { width, height } = useWindowDimensions();

  useEffect(() => {
    if (!visible || !storagePath) {
      setUrl(null);
      return;
    }
    setError(null);
    getSignedUrl(bucket, storagePath, 600)
      .then(setUrl)
      .catch((e) =>
        setError(e instanceof Error ? e.message : "Failed to load image")
      );
  }, [visible, storagePath, bucket]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.closeBtn} onPress={onClose}>
          <Text style={styles.closeText}>✕</Text>
        </Pressable>
        {!url && !error && <ActivityIndicator size="large" color={colors.primary} />}
        {error && <Text style={styles.error}>{error}</Text>}
        {url && (
          <Image
            source={{ uri: url }}
            style={{ width, height, resizeMode: "contain" }}
          />
        )}
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtn: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
    backgroundColor: "rgba(255,255,255,0.15)",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
  error: {
    color: colors.danger,
    fontSize: fontSize.base,
    paddingHorizontal: space.xl,
    textAlign: "center",
  },
});
