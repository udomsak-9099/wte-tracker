import { zodResolver } from "@hookform/resolvers/zod";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
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
import { useProject } from "@/contexts/project";
import { useCreateDailyReport, useEpcSystem } from "@/features/epc/queries";
import {
  dailyReportSchema,
  type DailyReportInput,
} from "@/features/epc/validators";
import { logActivity } from "@/lib/activity";
import { supabase } from "@/lib/supabase";
import { colors, fontSize, fontWeight, radius, space } from "@/lib/theme";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function NewDailyReport() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { current } = useProject();
  const system = useEpcSystem(id);
  const create = useCreateDailyReport(id);
  const [photos, setPhotos] = useState<PhotoUpload[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);

  const { control, handleSubmit, formState } = useForm<DailyReportInput>({
    resolver: zodResolver(dailyReportSchema),
    defaultValues: {
      report_date: today(),
      manpower_count: 0,
      weather: "",
      activities: "",
      remarks: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      const report = await create.mutateAsync({
        report_date: values.report_date,
        manpower_count: values.manpower_count,
        weather: values.weather || null,
        activities: values.activities,
        remarks: values.remarks || null,
      });
      if (photos.length > 0) {
        await supabase.from("attachments").insert(
          photos.map((p) => ({
            entity_type: "epc_daily_report",
            entity_id: report.id,
            storage_path: p.path,
            mime_type: "image/jpeg",
          }))
        );
        await logActivity(
          "attach_photos",
          "epc_daily_reports",
          report.id,
          { count: photos.length }
        );
      }
      router.back();
    } catch (e) {
      setServerError(e instanceof Error ? e.message : "Failed to save");
    }
  });

  if (!current) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>Select a project first.</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{ title: `Report · ${system.data?.name ?? ""}` }}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Field
            control={control}
            name="report_date"
            label="Report date (YYYY-MM-DD)"
            placeholder="2026-04-29"
          />
          <Field
            control={control}
            name="manpower_count"
            label="Manpower count"
            placeholder="0"
            keyboardType="number-pad"
          />
          <Field
            control={control}
            name="weather"
            label="Weather"
            placeholder="Sunny, 32°C / Heavy rain"
          />
          <Field
            control={control}
            name="activities"
            label="Activities"
            placeholder="What was done today?"
            multiline
            numberOfLines={5}
          />
          <Field
            control={control}
            name="remarks"
            label="Remarks (optional)"
            placeholder="Any blockers, delays, notes…"
            multiline
            numberOfLines={3}
          />

          <PhotoPicker
            projectId={current.id}
            entityType="epc_daily_report"
            photos={photos}
            onChange={setPhotos}
          />

          {serverError && <Text style={styles.error}>{serverError}</Text>}

          <Pressable
            style={[styles.submit, formState.isSubmitting && { opacity: 0.6 }]}
            onPress={onSubmit}
            disabled={formState.isSubmitting}
          >
            {formState.isSubmitting ? (
              <ActivityIndicator color={colors.text} />
            ) : (
              <Text style={styles.submitText}>Save report</Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

type FieldProps = {
  control: ReturnType<typeof useForm<DailyReportInput>>["control"];
  name: keyof DailyReportInput;
  label: string;
  placeholder?: string;
  keyboardType?: "default" | "number-pad";
  multiline?: boolean;
  numberOfLines?: number;
};

function Field({ control, name, label, ...rest }: FieldProps) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <View>
          <Text style={styles.label}>{label}</Text>
          <TextInput
            style={[
              styles.input,
              rest.multiline && { minHeight: 80, textAlignVertical: "top" },
              fieldState.error && { borderColor: colors.danger },
            ]}
            value={String(field.value ?? "")}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            placeholderTextColor={colors.textDim}
            {...rest}
          />
          {fieldState.error?.message && (
            <Text style={styles.fieldError}>{fieldState.error.message}</Text>
          )}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  content: { padding: space.lg, gap: space.md },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
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
  submit: {
    backgroundColor: colors.primary,
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
  fieldError: { color: colors.danger, fontSize: fontSize.xs, marginTop: 4, marginLeft: 4 },
  empty: { color: colors.textMuted, textAlign: "center" },
});
