import { Tabs } from "expo-router";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAuth } from "@/contexts/auth";

export default function TabLayout() {
  const { profile } = useAuth();
  const role = profile?.role;
  const showFinance =
    role === "admin" || role === "epc_pm" || role === "investor" || role === "bank";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#3b82f6",
        headerShown: true,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => (
            <IconSymbol size={size} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="epc"
        options={{
          title: "EPC",
          tabBarIcon: ({ color, size }) => (
            <IconSymbol size={size} name="hammer.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="safety"
        options={{
          title: "Safety",
          tabBarIcon: ({ color, size }) => (
            <IconSymbol size={size} name="shield.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="finance"
        options={{
          title: "Finance",
          href: showFinance ? undefined : null,
          tabBarIcon: ({ color, size }) => (
            <IconSymbol size={size} name="dollarsign.circle.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: "More",
          tabBarIcon: ({ color, size }) => (
            <IconSymbol size={size} name="ellipsis.circle.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
