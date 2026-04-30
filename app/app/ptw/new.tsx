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

import { DateField } from "@/components/ui-kit/DateField";
import { Select } from "@/components/ui-kit/Select";
import { useProject } from "@/contexts/project";
import { useCreatePtw } from "@/features/ptw/queries";
import {
  ptwSchema,
  ptwTypeOptions,
  type PtwInput,
} from "@/features/ptw/validators";
import { colors, fontSize, fontWeight, radius, space } from "@/lib/theme";

function nowIso(): string {
  const d = new Date();
  d.setSeconds(0, 0);
  return d.toISOString().slice(0, 16);
}
function plus8h(): string {
  const d = new Date();
  d.setHours(d.getHours() + 8);
  d.setSeconds(0, 0);
  return d.toISOString().slice(0, 16);
}

export default function NewPtw() {
  const { current } = useProject();
  const router = useRouter();
  const create = useCreatePtw(current?.id ?? "");
  const [serverError, setServerError] = useState<string | null>(null);

  const { control, handleSubmit, formState } = useForm<PtwInput>({
    resolver: zodResolver(ptwSchema),
    defaultValues: {
      ptw_type: "",
      work_description: "",
      location: "",
      start_time: nowIso(),
      end_time: plus8h(),
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    if (!current) return;
    try {
      await create.mutateAsync({
        ptw_type: values.ptw_type,
        work_description: values.work_description,
        location: values.location,
        start_time: new Date(values.start_time).toISOString(),
        end_time: new Date(values.end_time).toISOString(),
      });
      router.back();
    } catch (e) {
      setServerError(e instanceof Error ? e.message : "Failed to save");
    }
  });

  return (
    <>
      <Stack.Screen options={{ title: "Request PTW" }} />
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
            name="ptw_type"
            render={({ field, fieldState }) => (
              <Select
                label="Work type"
                options={ptwTypeOptions}
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
                placeholder="Boiler floor, Level 3"
                value={field.value}
                onChangeText={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="work_description"
            render={({ field, fieldState }) => (
              <Field
                label="Work description"
                placeholder="Scope, methods, equipment, hazards…"
                value={field.value}
                onChangeText={field.onChange}
                error={fieldState.error?.message}
                multiline
              />
            )}
          />

          <Controller
            control={control}
            name="start_time"
            render={({ field, fieldState }) => (
              <DateField
                label="Start"
                mode="datetime"
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="end_time"
            render={({ field, fieldState }) => (
              <DateField
                label="End"
                mode="datetime"
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
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
              <Text style={styles.submitText}>Submit request</Text>
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

function Field({ label, placeholder, value, onChangeText, error, multiline }: FieldProps) {
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
