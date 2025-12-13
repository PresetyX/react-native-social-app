import { configureStore } from "@reduxjs/toolkit";
import type { SocialService } from "../services/types";
import auth from "./authSlice";
import chat from "./chatSlice";
import posts from "./postsSlice";

export function makeStore(service: SocialService) {
  return configureStore({
    reducer: { auth, posts, chat },
    middleware: (getDefault) => getDefault({ thunk: { extraArgument: { service } } }),
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
