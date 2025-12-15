import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StatusBar } from "expo-status-bar";
import { useMemo } from "react";
import { Provider } from "react-redux";
import { createService } from "./src/services";
import { ChatScreen } from "./src/screens/ChatScreen";
import { FeedScreen } from "./src/screens/FeedScreen";
import { LoginScreen } from "./src/screens/LoginScreen";
import { ProfileScreen } from "./src/screens/ProfileScreen";
import { makeStore } from "./src/store";
import { useAppSelector } from "./src/store/hooks";
import type { SocialService } from "./src/services/types";

const Tab = createBottomTabNavigator();

function Root({ service }: { service: SocialService }) {
  const user = useAppSelector((s) => s.auth.user);
  if (!user) return <LoginScreen />;
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Feed" component={FeedScreen} />
        <Tab.Screen name="Chat">{() => <ChatScreen service={service} />}</Tab.Screen>
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  const service = useMemo(createService, []);
  const store = useMemo(() => makeStore(service), [service]);
  return (
    <Provider store={store}>
      <StatusBar style="auto" />
      <Root service={service} />
    </Provider>
  );
}
