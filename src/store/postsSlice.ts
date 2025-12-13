import { createSlice } from "@reduxjs/toolkit";
import type { Post, User } from "../types";
import { createAppThunk } from "./thunk";

export const loadPosts = createAppThunk("posts/load", (_: void, { extra }) => extra.service.fetchPosts());
export const addPost = createAppThunk("posts/add", (arg: { user: User; text: string }, { extra }) =>
  extra.service.createPost(arg.user, arg.text));
export const toggleLike = createAppThunk("posts/like", (arg: { postId: string; userId: string }, { extra }) =>
  extra.service.toggleLike(arg.postId, arg.userId));

interface PostsState {
  items: Post[];
  loading: boolean;
  error: string | null;
}

const initialState: PostsState = { items: [], loading: false, error: null };

const postsSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(loadPosts.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(loadPosts.fulfilled, (s, a) => { s.loading = false; s.items = a.payload; })
      .addCase(loadPosts.rejected, (s, a) => { s.loading = false; s.error = a.error.message ?? "Could not load posts"; })
      .addCase(addPost.fulfilled, (s, a) => { s.items.unshift(a.payload); s.error = null; })
      .addCase(addPost.rejected, (s, a) => { s.error = a.error.message ?? "Could not publish"; })
      .addCase(toggleLike.fulfilled, (s, a) => {
        const i = s.items.findIndex((p) => p.id === a.payload.id);
        if (i >= 0) s.items[i] = a.payload;
      });
  },
});

export default postsSlice.reducer;
