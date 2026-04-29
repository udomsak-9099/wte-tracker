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

import { Select } from "@/components/ui-kit/Select";
import { useProject } from "@/contexts/project";
import { useCreateEnvRecord } from "@/features/environment/queries";
import {
  envCategoryOptions,
  envRecordSchema,
  type EnvRecordInput,
} from "@/features/environment/validators";
import { colors, fontSize, fontWeight, radius, space } from "@/lib/theme";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function NewEnvRecord() {
  const { current } = useProject();
  const router = useRouter();
  const create = useCreateEnvRecord(current?.id ?? "");
  const [serverError, setServerError] = useState<string | null>(null);

  const { control, handleSubmit, formState } = useForm<EnvRecordInput>({
    resolver: zodResolver(envRecordSchema),
    defaultValues: {
      record_date: today(),
      category: "",
      parameter: "",
      value: 0,
      unit: "",
      threshold_min: undefined,
      threshold_max: undefined,
      notes: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    if (!current) return;
    try {
      await create.mutateAsync({
        record_date: values.record_date,
        category: values.category,
        parameter: values.parameter,
        value: values.value,
        unit: values.unit || null,
        threshold_min: values.threshold_min ?? null,
        threshold_max: values.threshold_max ?? null,
        notes: values.notes || null,
      });
      router.back();
    } catch (e) {
      setServerError(e instanceof Error ? e.message : "Failed to save");
    }
  });

  return (
    <>
      <Stack.Screen options={{ title: "New environmental record" }} />
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
            name="record_date"
            render={({ field, fieldState }) => (
              <Field
                label="Date"
                placeholder="YYYY-MM-DD"
                value={field.value}
                onChangeText={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="category"
            render={({ field, fieldState }) => (
              <Select
                label="Category"
                options={envCategoryOptions}
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="parameter"
            render={({ field, fieldState }) => (
              <Field
                label="Parameter"
                placeholder="e.g. PM2.5, NOx, BOD"
                value={field.value}
                onChangeText={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />

          <View style={styles.row}>
            <View style={styles.flex}>
              <Controller
                control={control}
                name="value"
                render={({ field, fieldState }) => (
                  <Field
                    label="Value"
                    placeholder="0"
                    value={String(field.value ?? "")}
                    onChangeText={field.onChange}
                    keyboardType="decimal-pad"
                    error={fieldState.error?.message}
                  />
                )}
              />
            </View>
            <View style={styles.flex}>
              <Controller
                control={control}
                name="unit"
                render={({ field }) => (
                  <Field
                    label="Unit"
                    placeholder="µg/m³, mg/L"
                    value={field.value ?? ""}
                    onChangeText={field.onChange}
                  />
                )}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.flex}>
              <Controller
                control={control}
                name="threshold_min"
                render={({ field }) => (
                  <Field
                    label="Min limit"
                    placeholder="optional"
                    value={String(field.value ?? "")}
                    onChangeText={(v) =>
                      field.onChange(v === "" ? undefined : v)
                    }
                    keyboardType="decimal-pad"
                  />
                )}
              />
            </View>
            <View style={styles.flex}>
              <Controller
                control={control}
                name="threshold_max"
                render={({ field }) => (
                  <Field
                    label="Max limit"
                    placeholder="optional"
                    value={String(field.value ?? "")}
                    onChangeText={(v) =>
                      field.onChange(v === "" ? undefined : v)
                    }
                    keyboardType="decimal-pad"
                  />
                )}
              />
            </View>
          </View>

          <Controller
            control={control}
            name="notes"
            render={({ field }) => (
              <Field
                label="Notes (optional)"
                placeholder="Sample location, method…"
                value={field.value ?? ""}
                onChangeText={field.onChange}
                multiline
              />
            )}
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
              <Text style={styles.submitText}>Save record</Text>
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
  keyboardType?: "default" | "decimal-pad";
  multiline?: boolean;
  error?: string;
};

function Field({ label, placeholder, value, onChangeText, keyboardType, multiline, error }: FieldProps) {
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
        keyboardType={keyboardType}
        multiline={multiline}
      />
      {error && <Text style={styles.fieldError}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.lg, gap: space.md, paddingBottom: 32 },
  row: { flexDirection: "row", gap: space.md },
  flex: { flex: 1 },
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
  multiline: { minHeight: 80, textAlignVertical: "top" },
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
  fieldError: { color: colors.danger, fontSize: fontSize.xs, marginTop: 4 },
});
