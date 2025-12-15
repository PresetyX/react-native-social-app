import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { MockService } from "../src/services/mockService";
import { makeStore } from "../src/store";
import { signIn, saveProfile } from "../src/store/authSlice";
import { messagesReceived } from "../src/store/chatSlice";
import { addPost, loadPosts, toggleLike } from "../src/store/postsSlice";

const setup = () => {
  const service = new MockService(-1); // -1 disables the echo bot
  return { service, store: makeStore(service) };
};

describe("auth", () => {
  it("signs in and rejects short names", async () => {
    const { store } = setup();
    await store.dispatch(signIn("A"));
    assert.equal(store.getState().auth.user, null);
    assert.match(store.getState().auth.error ?? "", /at least 2/);
    await store.dispatch(signIn("Ada Lovelace"));
    assert.equal(store.getState().auth.user?.name, "Ada Lovelace");
    assert.equal(store.getState().auth.error, null);
  });

  it("updates the profile", async () => {
    const { store } = setup();
    await store.dispatch(signIn("Ada"));
    const user = store.getState().auth.user!;
    await store.dispatch(saveProfile({ user, name: "Ada L.", bio: "Maths" }));
    assert.deepEqual([store.getState().auth.user?.name, store.getState().auth.user?.bio], ["Ada L.", "Maths"]);
  });
});

describe("posts", () => {
  it("publishes, validates, and toggles likes", async () => {
    const { store } = setup();
    await store.dispatch(signIn("Ada"));
    const user = store.getState().auth.user!;
    await store.dispatch(loadPosts());
    const seeded = store.getState().posts.items.length;

    await store.dispatch(addPost({ user, text: "   " }));
    assert.match(store.getState().posts.error ?? "", /Write something/);
    await store.dispatch(addPost({ user, text: "x".repeat(281) }));
    assert.match(store.getState().posts.error ?? "", /280/);

    await store.dispatch(addPost({ user, text: " hello world " }));
    const [first] = store.getState().posts.items;
    assert.equal(first.text, "hello world");
    assert.equal(store.getState().posts.items.length, seeded + 1);

    await store.dispatch(toggleLike({ postId: first.id, userId: user.id }));
    assert.deepEqual(store.getState().posts.items[0].likes, [user.id]);
    await store.dispatch(toggleLike({ postId: first.id, userId: user.id }));
    assert.deepEqual(store.getState().posts.items[0].likes, []);
  });
});

describe("chat", () => {
  it("delivers messages to subscribers in order and stops after unsubscribe", async () => {
    const { service, store } = setup();
    const user = await service.signIn("Ada");
    const unsubscribe = service.subscribeMessages("general", (messages) =>
      store.dispatch(messagesReceived({ chatId: "general", messages })));
    await service.sendMessage("general", user, "one");
    await service.sendMessage("general", user, "two");
    assert.deepEqual(store.getState().chat.messages.general.map((m) => m.text), ["one", "two"]);
    unsubscribe();
    await service.sendMessage("general", user, "three");
    assert.equal(store.getState().chat.messages.general.length, 2);
  });

  it("replies with the echo bot when enabled", async () => {
    const service = new MockService(5);
    const user = await service.signIn("Ada");
    const seen: string[] = [];
    service.subscribeMessages("random", (m) => { seen.splice(0, seen.length, ...m.map((x) => x.text)); });
    await service.sendMessage("random", user, "ping");
    await new Promise((r) => setTimeout(r, 30));
    assert.deepEqual(seen, ["ping", "Echo: ping"]);
  });
});
