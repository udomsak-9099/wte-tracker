import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/contexts/auth";
import { colors, fontSize, fontWeight, radius, space } from "@/lib/theme";
import {
  signInSchema,
  signUpSchema,
  type SignUpInput,
} from "@/lib/validators";

type Mode = "signin" | "signup";

export default function Login() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<Mode>("signin");
  const [serverError, setServerError] = useState<string | null>(null);

  const schema = mode === "signin" ? signInSchema : signUpSchema;
  const { control, handleSubmit, formState } = useForm<SignUpInput>({
    resolver: zodResolver(schema as never),
    defaultValues: { email: "", password: "", fullName: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    const { error } =
      mode === "signin"
        ? await signIn(values.email, values.password)
        : await signUp(
            values.email,
            values.password,
            values.fullName || values.email.split("@")[0]
          );
    if (error) setServerError(error);
  });

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.kb}
      >
        <View style={styles.container}>
          <Text style={styles.title}>WTE Tracker</Text>
          <Text style={styles.subtitle}>
            GP4 Surat Thani 6.6 MW Waste-to-Energy
          </Text>

          {mode === "signup" && (
            <Field
              control={control}
              name="fullName"
              placeholder="Full name"
              autoCapitalize="words"
            />
          )}

          <Field
            control={control}
            name="email"
            placeholder="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />

          <Field
            control={control}
            name="password"
            placeholder="Password"
            secureTextEntry
            autoComplete="password"
          />

          {serverError && <Text style={styles.error}>{serverError}</Text>}

          <Pressable
            style={[styles.button, formState.isSubmitting && { opacity: 0.6 }]}
            onPress={onSubmit}
            disabled={formState.isSubmitting}
          >
            {formState.isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                {mode === "signin" ? "Sign in" : "Create account"}
              </Text>
            )}
          </Pressable>

          <Pressable
            onPress={() => setMode(mode === "signin" ? "signup" : "signin")}
          >
            <Text style={styles.switch}>
              {mode === "signin"
                ? "New user? Create account"
                : "Have an account? Sign in"}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

type FieldProps = {
  control: ReturnType<typeof useForm<SignUpInput>>["control"];
  name: keyof SignUpInput;
  placeholder: string;
  secureTextEntry?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  keyboardType?: "default" | "email-address";
  autoComplete?: "email" | "password" | "off";
};

function Field({ control, name, ...rest }: FieldProps) {
  const { placeholder, ...inputRest } = rest;
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <View>
          <TextInput
            style={[
              styles.input,
              fieldState.error && { borderColor: colors.danger },
            ]}
            placeholder={placeholder}
            placeholderTextColor={colors.textDim}
            value={field.value as string}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            {...inputRest}
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
  safe: { flex: 1, backgroundColor: colors.bg },
  kb: { flex: 1 },
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: space.xl,
    gap: space.md,
    maxWidth: 480,
    width: "100%",
    alignSelf: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: fontWeight.bold,
    color: colors.text,
    textAlign: "center",
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: "center",
    marginBottom: space.xl,
  },
  input: {
    backgroundColor: colors.bgElevated,
    color: colors.text,
    borderRadius: radius.md,
    paddingHorizontal: space.lg,
    paddingVertical: 14,
    fontSize: fontSize.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: space.sm,
  },
  buttonText: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  switch: {
    color: colors.textLink,
    textAlign: "center",
    marginTop: space.sm,
    fontSize: fontSize.sm,
  },
  error: { color: colors.danger, textAlign: "center", fontSize: fontSize.sm },
  fieldError: { color: colors.danger, fontSize: fontSize.xs, marginTop: 4, marginLeft: 4 },
});
