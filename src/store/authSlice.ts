import { createSlice } from "@reduxjs/toolkit";
import type { User } from "../types";
import { createAppThunk } from "./thunk";

export const signIn = createAppThunk("auth/signIn", (name: string, { extra }) => extra.service.signIn(name));
export const signOut = createAppThunk("auth/signOut", (_: void, { extra }) => extra.service.signOut());
export const saveProfile = createAppThunk(
  "auth/saveProfile",
  (arg: { user: User; name: string; bio: string }, { extra }) =>
    extra.service.updateProfile(arg.user, { name: arg.name, bio: arg.bio }),
);

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = { user: null, loading: false, error: null };

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(signIn.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(signIn.fulfilled, (s, a) => { s.loading = false; s.user = a.payload; })
      .addCase(signIn.rejected, (s, a) => { s.loading = false; s.error = a.error.message ?? "Sign in failed"; })
      .addCase(signOut.fulfilled, () => initialState)
      .addCase(saveProfile.fulfilled, (s, a) => { s.user = a.payload; })
      .addCase(saveProfile.rejected, (s, a) => { s.error = a.error.message ?? "Could not save profile"; });
  },
});

export default authSlice.reducer;
