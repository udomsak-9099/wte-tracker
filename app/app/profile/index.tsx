import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import { colors, fontSize, fontWeight, radius, space } from "@/lib/theme";

export default function ProfileScreen() {
  const { profile, session } = useAuth();
  const qc = useQueryClient();
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const update = useMutation({
    mutationFn: async () => {
      if (!session?.user) throw new Error("Not signed in");
      const update = {
        full_name: fullName.trim(),
        phone: phone.trim() || null,
      };
      const { error } = await supabase
        .from("profiles")
        .update(update as never)
        .eq("id", session.user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      setSavedAt(Date.now());
      qc.invalidateQueries({ queryKey: ["profile"] });
    },
  });

  return (
    <>
      <Stack.Screen options={{ title: "Profile" }} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Field label="Email" value={session?.user.email ?? "—"} readonly />
          <Field
            label="Role"
            value={profile?.role ?? "—"}
            readonly
            note="Role can only be changed by an admin."
          />
        </View>

        <View style={styles.card}>
          <View>
            <Text style={styles.label}>Full name</Text>
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Your name"
              placeholderTextColor={colors.textDim}
            />
          </View>
          <View>
            <Text style={styles.label}>Phone</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="+66 8 1234 5678"
              placeholderTextColor={colors.textDim}
              keyboardType="phone-pad"
            />
          </View>

          {update.error && (
            <Text style={styles.error}>
              {update.error instanceof Error
                ? update.error.message
                : "Failed to save"}
            </Text>
          )}
          {savedAt && (
            <Text style={styles.saved}>Saved · {new Date(savedAt).toLocaleTimeString()}</Text>
          )}

          <Pressable
            style={[styles.btn, update.isPending && { opacity: 0.6 }]}
            onPress={() => update.mutate()}
            disabled={update.isPending}
          >
            {update.isPending ? (
              <ActivityIndicator color={colors.text} />
            ) : (
              <Text style={styles.btnText}>Save changes</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </>
  );
}

function Field({
  label,
  value,
  readonly,
  note,
}: {
  label: string;
  value: string;
  readonly?: boolean;
  note?: string;
}) {
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.input, readonly && styles.readonly]}>
        <Text style={styles.readonlyText}>{value}</Text>
      </View>
      {note && <Text style={styles.note}>{note}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.lg, gap: space.md },
  card: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    padding: space.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: space.md,
  },
  label: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  input: {
    backgroundColor: colors.bg,
    color: colors.text,
    borderRadius: radius.md,
    paddingHorizontal: space.lg,
    paddingVertical: 12,
    fontSize: fontSize.md,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 46,
    justifyContent: "center",
  },
  readonly: { backgroundColor: colors.bg, opacity: 0.7 },
  readonlyText: { color: colors.textMuted, fontSize: fontSize.md },
  note: { color: colors.textDim, fontSize: fontSize.xs, marginTop: 4 },
  btn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: "center",
  },
  btnText: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  error: { color: colors.danger, fontSize: fontSize.sm },
  saved: { color: colors.success, fontSize: fontSize.xs },
});
