import { MockService } from "./mockService";
import type { SocialService } from "./types";

/** Firebase when every EXPO_PUBLIC_FIREBASE_* variable is set, otherwise the in-memory backend. */
export function createService(): SocialService {
  const apiKey = process.env.EXPO_PUBLIC_FIREBASE_API_KEY;
  const authDomain = process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN;
  const projectId = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;
  const appId = process.env.EXPO_PUBLIC_FIREBASE_APP_ID;
  if (apiKey && authDomain && projectId && appId) {
    // required lazily so the Firebase SDK is not loaded when running on the mock backend
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { FirebaseService } = require("./firebaseService") as typeof import("./firebaseService");
    return new FirebaseService({ apiKey, authDomain, projectId, appId });
  }
  return new MockService();
}
