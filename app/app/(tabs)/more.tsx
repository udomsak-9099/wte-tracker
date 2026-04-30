import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/contexts/auth";
import { useProject } from "@/contexts/project";
import { colors, fontSize, fontWeight, radius, space } from "@/lib/theme";

export default function More() {
  const { profile, signOut } = useAuth();
  const { current, projects, setCurrent } = useProject();
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <View style={styles.content}>
        <Pressable
          style={styles.profileCard}
          onPress={() => router.push("/profile")}
        >
          <Text style={styles.name}>{profile?.full_name ?? "—"}</Text>
          <Text style={styles.role}>{profile?.role}</Text>
          <Text style={styles.profileEdit}>Edit profile ›</Text>
        </Pressable>

        {projects.length > 1 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Project</Text>
            <View style={styles.menu}>
              {projects.map((p) => (
                <Pressable
                  key={p.id}
                  style={styles.item}
                  onPress={() => setCurrent(p.id)}
                >
                  <Text style={styles.itemText}>{p.name}</Text>
                  <Text style={styles.chev}>
                    {p.id === current?.id ? "✓" : ""}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        <View style={styles.menu}>
          <MenuItem
            label="Permits & Licensing"
            onPress={() => router.push("/permits")}
          />
          <MenuItem
            label="Equipment & Shipments"
            onPress={() => router.push("/equipment")}
          />
          <MenuItem
            label="CPM / PERT Schedule"
            onPress={() => router.push("/cpm" as never)}
          />
          <MenuItem
            label="Issues"
            onPress={() => router.push("/issues")}
          />
          <MenuItem
            label="Permit to Work"
            onPress={() => router.push("/ptw")}
          />
          <MenuItem
            label="Reports"
            onPress={() => router.push("/reports")}
          />
          <MenuItem
            label="Environmental"
            onPress={() => router.push("/environment")}
          />
          <MenuItem
            label="Activity Log"
            onPress={() => router.push("/activity")}
          />
        </View>

        <Pressable style={styles.signOut} onPress={signOut}>
          <Text style={styles.signOutText}>Sign out</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function MenuItem({
  label,
  onPress,
}: {
  label: string;
  onPress?: () => void;
}) {
  return (
    <Pressable style={styles.item} onPress={onPress}>
      <Text style={styles.itemText}>{label}</Text>
      <Text style={styles.chev}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: space.lg, gap: space.lg, flex: 1 },
  profileCard: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  name: { color: colors.text, fontSize: fontSize.lg, fontWeight: fontWeight.bold },
  role: {
    color: colors.textLink,
    fontSize: fontSize.sm,
    textTransform: "uppercase",
    marginTop: 4,
  },
  profileEdit: {
    color: colors.textDim,
    fontSize: fontSize.xs,
    marginTop: 6,
  },
  section: { gap: space.sm },
  sectionTitle: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    textTransform: "uppercase",
    marginLeft: 4,
  },
  menu: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: space.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  itemText: { color: colors.text, fontSize: fontSize.base },
  chev: { color: colors.textDim, fontSize: 20 },
  signOut: {
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.md,
    padding: space.lg,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.dangerBorder,
    marginTop: "auto",
  },
  signOutText: {
    color: colors.danger,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
});
