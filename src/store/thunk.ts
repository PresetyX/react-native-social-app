import { createAsyncThunk } from "@reduxjs/toolkit";
import type { SocialService } from "../services/types";

/** Typed thunk factory: every thunk receives the backend through `extra`, so tests can inject a mock. */
export const createAppThunk = createAsyncThunk.withTypes<{ extra: { service: SocialService } }>();
