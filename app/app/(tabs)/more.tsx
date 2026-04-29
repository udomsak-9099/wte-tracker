import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/contexts/auth";

export default function More() {
  const { profile, signOut } = useAuth();

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <View style={styles.content}>
        <View style={styles.profileCard}>
          <Text style={styles.name}>{profile?.full_name ?? "—"}</Text>
          <Text style={styles.role}>{profile?.role}</Text>
        </View>

        <View style={styles.menu}>
          <MenuItem label="Permits & Licensing" />
          <MenuItem label="Equipment & Shipments" />
          <MenuItem label="Reports" />
          <MenuItem label="Environmental" />
          <MenuItem label="Activity Log" />
          <MenuItem label="Settings" />
        </View>

        <Pressable style={styles.signOut} onPress={signOut}>
          <Text style={styles.signOutText}>Sign out</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function MenuItem({ label }: { label: string }) {
  return (
    <Pressable style={styles.item}>
      <Text style={styles.itemText}>{label}</Text>
      <Text style={styles.chev}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0f1225" },
  content: { padding: 16, gap: 16, flex: 1 },
  profileCard: {
    backgroundColor: "#1a1f3a",
    borderRadius: 12,
    padding: 18,
    borderWidth: 1,
    borderColor: "#2a3050",
  },
  name: { color: "#fff", fontSize: 18, fontWeight: "700" },
  role: { color: "#7eb1ff", fontSize: 13, textTransform: "uppercase", marginTop: 4 },
  menu: {
    backgroundColor: "#1a1f3a",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2a3050",
    overflow: "hidden",
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#2a3050",
  },
  itemText: { color: "#fff", fontSize: 15 },
  chev: { color: "#7a8099", fontSize: 20 },
  signOut: {
    backgroundColor: "#2a1a1a",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#5a2a2a",
    marginTop: "auto",
  },
  signOutText: { color: "#ff6b6b", fontSize: 15, fontWeight: "600" },
});
