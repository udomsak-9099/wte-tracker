import { zodResolver } from "@hookform/resolvers/zod";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { PhotoPicker, type PhotoUpload } from "@/components/ui-kit/PhotoPicker";
import { Select } from "@/components/ui-kit/Select";
import { useProject } from "@/contexts/project";
import { useCreateSafetyIncident } from "@/features/safety/queries";
import {
  incidentTypeOptions,
  safetyIncidentSchema,
  type SafetyIncidentInput,
} from "@/features/safety/validators";
import { logActivity } from "@/lib/activity";
import { supabase } from "@/lib/supabase";
import { colors, fontSize, fontWeight, radius, space } from "@/lib/theme";

const SEVERITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function NewSafetyIncident() {
  const { current } = useProject();
  const router = useRouter();
  const create = useCreateSafetyIncident(current?.id ?? "");
  const [photos, setPhotos] = useState<PhotoUpload[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);

  const { control, handleSubmit, formState } = useForm<SafetyIncidentInput>({
    resolver: zodResolver(safetyIncidentSchema),
    defaultValues: {
      incident_date: today(),
      incident_type: "",
      location: "",
      description: "",
      severity: "medium",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    if (!current) {
      setServerError("Select a project first");
      return;
    }
    try {
      const incident = await create.mutateAsync(values);
      if (photos.length > 0) {
        const incidentId = (incident as { id: string }).id;
        await supabase.from("attachments").insert(
          photos.map((p) => ({
            entity_type: "safety_incident",
            entity_id: incidentId,
            storage_path: p.path,
            mime_type: "image/jpeg",
          })) as never
        );
        await logActivity(
          "attach_photos",
          "safety_incidents",
          incidentId,
          { count: photos.length }
        );
      }
      router.back();
    } catch (e) {
      setServerError(e instanceof Error ? e.message : "Failed to save");
    }
  });

  return (
    <>
      <Stack.Screen options={{ title: "Report incident" }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Controller
            control={control}
            name="incident_date"
            render={({ field, fieldState }) => (
              <Field
                label="Date (YYYY-MM-DD)"
                placeholder="2026-04-29"
                value={field.value}
                onChangeText={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="incident_type"
            render={({ field, fieldState }) => (
              <Select
                label="Type"
                options={incidentTypeOptions}
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="severity"
            render={({ field, fieldState }) => (
              <Select
                label="Severity"
                options={SEVERITY_OPTIONS}
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="location"
            render={({ field, fieldState }) => (
              <Field
                label="Location"
                placeholder="Boiler area, Level 2"
                value={field.value}
                onChangeText={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="description"
            render={({ field, fieldState }) => (
              <Field
                label="Description"
                placeholder="What happened, who was involved, immediate action taken…"
                value={field.value}
                onChangeText={field.onChange}
                error={fieldState.error?.message}
                multiline
              />
            )}
          />

          {current && (
            <PhotoPicker
              projectId={current.id}
              entityType="safety_incident"
              photos={photos}
              onChange={setPhotos}
            />
          )}

          {serverError && <Text style={styles.error}>{serverError}</Text>}

          <Pressable
            style={[styles.submit, formState.isSubmitting && { opacity: 0.6 }]}
            onPress={onSubmit}
            disabled={formState.isSubmitting}
          >
            {formState.isSubmitting ? (
              <ActivityIndicator color={colors.text} />
            ) : (
              <Text style={styles.submitText}>Save incident</Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

type FieldProps = {
  label: string;
  placeholder?: string;
  value: string;
  onChangeText: (v: string) => void;
  error?: string;
  multiline?: boolean;
};

function Field({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  multiline,
}: FieldProps) {
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          multiline && styles.multiline,
          error && { borderColor: colors.danger },
        ]}
        placeholder={placeholder}
        placeholderTextColor={colors.textDim}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
      />
      {error && <Text style={styles.fieldError}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.lg, gap: space.md, paddingBottom: 32 },
  label: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  input: {
    backgroundColor: colors.bgElevated,
    color: colors.text,
    borderRadius: radius.md,
    paddingHorizontal: space.lg,
    paddingVertical: 12,
    fontSize: fontSize.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  multiline: { minHeight: 100, textAlignVertical: "top" },
  submit: {
    backgroundColor: colors.danger,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: space.md,
  },
  submitText: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  error: { color: colors.danger, textAlign: "center", fontSize: fontSize.sm },
  fieldError: { color: colors.danger, fontSize: fontSize.xs, marginTop: 4 },
});
