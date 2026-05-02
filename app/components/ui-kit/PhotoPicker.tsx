import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { uploadFile } from "@/lib/storage";
import { colors, fontSize, fontWeight, radius, space } from "@/lib/theme";

export type PhotoUpload = { path: string; localUri: string };

type Props = {
  projectId: string;
  entityType: string;
  photos: PhotoUpload[];
  onChange: (photos: PhotoUpload[]) => void;
  max?: number;
};

export function PhotoPicker({
  projectId,
  entityType,
  photos,
  onChange,
  max = 6,
}: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pick() {
    setError(null);
    if (photos.length >= max) {
      setError(`Maximum ${max} photos`);
      return;
    }
    if (Platform.OS !== "web") {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        setError("Permission denied");
        return;
      }
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsMultipleSelection: false,
      base64: Platform.OS !== "web",
    });
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];

    setBusy(true);
    try {
      const fileName = asset.fileName ?? `photo-${Date.now()}.jpg`;
      const contentType = asset.mimeType ?? "image/jpeg";
      const { path } = await uploadFile({
        bucket: "photos",
        projectId,
        entityType,
        fileUri: asset.uri,
        fileName,
        contentType,
        base64: asset.base64 ?? undefined,
      });
      onChange([...photos, { path, localUri: asset.uri }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  function remove(idx: number) {
    onChange(photos.filter((_, i) => i !== idx));
  }

  return (
    <View>
      <Text style={styles.label}>Photos ({photos.length}/{max})</Text>
      <View style={styles.grid}>
        {photos.map((p, i) => (
          <Pressable
            key={p.path}
            onLongPress={() => remove(i)}
            style={styles.tile}
          >
            <Image source={{ uri: p.localUri }} style={styles.thumb} />
            <Text style={styles.removeHint}>Hold to remove</Text>
          </Pressable>
        ))}
        {photos.length < max && (
          <Pressable style={styles.add} onPress={pick} disabled={busy}>
            {busy ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <Text style={styles.addText}>+ Add photo</Text>
            )}
          </Pressable>
        )}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    textTransform: "uppercase",
    marginBottom: space.sm,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: space.sm,
  },
  tile: {
    width: 88,
    height: 88,
    borderRadius: radius.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  },
  thumb: { width: "100%", height: "100%" },
  removeHint: {
    position: "absolute",
    bottom: 2,
    left: 2,
    right: 2,
    color: colors.text,
    fontSize: 9,
    textAlign: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingVertical: 1,
    borderRadius: 4,
  },
  add: {
    width: 88,
    height: 88,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: "dashed",
    backgroundColor: colors.bgElevated,
    alignItems: "center",
    justifyContent: "center",
  },
  addText: {
    color: colors.textLink,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  error: { color: colors.danger, fontSize: fontSize.xs, marginTop: space.sm },
});
