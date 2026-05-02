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
import {
  useCreateIssue,
  useProjectPhases,
} from "@/features/issues/queries";
import {
  issueSchema,
  type IssueInput,
} from "@/features/issues/validators";
import { colors, fontSize, fontWeight, radius, space } from "@/lib/theme";

const SEVERITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

export default function NewIssue() {
  const { current } = useProject();
  const router = useRouter();
  const phases = useProjectPhases(current?.id);
  const create = useCreateIssue(current?.id ?? "");
  const [serverError, setServerError] = useState<string | null>(null);

  const { control, handleSubmit, formState } = useForm<IssueInput>({
    resolver: zodResolver(issueSchema),
    defaultValues: {
      title: "",
      description: "",
      phase_id: "",
      severity: "medium",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      await create.mutateAsync({
        title: values.title,
        description: values.description || null,
        phase_id: values.phase_id,
        severity: values.severity,
        reported_date: new Date().toISOString().slice(0, 10),
      });
      router.back();
    } catch (e) {
      setServerError(e instanceof Error ? e.message : "Failed to save");
    }
  });

  const phaseOptions = (phases.data ?? []).map((p) => ({
    value: p.id,
    label: p.name,
  }));

  return (
    <>
      <Stack.Screen options={{ title: "Report issue" }} />
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
            name="title"
            render={({ field, fieldState }) => (
              <View>
                <Text style={styles.label}>Title</Text>
                <TextInput
                  style={[
                    styles.input,
                    fieldState.error && { borderColor: colors.danger },
                  ]}
                  placeholder="Short summary of the issue"
                  placeholderTextColor={colors.textDim}
                  value={field.value}
                  onChangeText={field.onChange}
                />
                {fieldState.error?.message && (
                  <Text style={styles.fieldError}>{fieldState.error.message}</Text>
                )}
              </View>
            )}
          />

          <Controller
            control={control}
            name="description"
            render={({ field }) => (
              <View>
                <Text style={styles.label}>Description (optional)</Text>
                <TextInput
                  style={[styles.input, styles.multiline]}
                  placeholder="More detail, impact, location…"
                  placeholderTextColor={colors.textDim}
                  value={field.value ?? ""}
                  onChangeText={field.onChange}
                  multiline
                  numberOfLines={5}
                />
              </View>
            )}
          />

          <Controller
            control={control}
            name="phase_id"
            render={({ field, fieldState }) => (
              <Select
                label="Phase"
                options={phaseOptions}
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

          {serverError && <Text style={styles.error}>{serverError}</Text>}

          <Pressable
            style={[
              styles.submit,
              formState.isSubmitting && { opacity: 0.6 },
            ]}
            onPress={onSubmit}
            disabled={formState.isSubmitting}
          >
            {formState.isSubmitting ? (
              <ActivityIndicator color={colors.text} />
            ) : (
              <Text style={styles.submitText}>Report issue</Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.lg, gap: space.md },
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
