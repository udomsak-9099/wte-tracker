import * as Sentry from "@sentry/react-native";
import PostHog from "posthog-react-native";

const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN;
const POSTHOG_KEY = process.env.EXPO_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = process.env.EXPO_PUBLIC_POSTHOG_HOST;

let initialized = false;
export let posthog: PostHog | null = null;

export function initObservability() {
  if (initialized) return;
  initialized = true;

  if (SENTRY_DSN) {
    Sentry.init({
      dsn: SENTRY_DSN,
      tracesSampleRate: 0.2,
      enableNative: true,
      enableAutoSessionTracking: true,
    });
  }

  if (POSTHOG_KEY) {
    posthog = new PostHog(POSTHOG_KEY, {
      host: POSTHOG_HOST,
      flushAt: 20,
      flushInterval: 30_000,
    });
  }
}

export function identifyUser(userId: string, email?: string, role?: string) {
  if (SENTRY_DSN) {
    Sentry.setUser({ id: userId, email });
  }
  if (posthog) {
    posthog.identify(userId, { email, role });
  }
}

export function clearUser() {
  if (SENTRY_DSN) Sentry.setUser(null);
  if (posthog) posthog.reset();
}

export function trackEvent(name: string, properties?: Record<string, unknown>) {
  if (posthog) posthog.capture(name, properties);
}

export function captureError(error: unknown, context?: Record<string, unknown>) {
  if (SENTRY_DSN) {
    Sentry.captureException(error, { extra: context });
  } else {
    console.error("[error]", error, context);
  }
}

export const sentryWrap = SENTRY_DSN ? Sentry.wrap : <T,>(c: T) => c;
