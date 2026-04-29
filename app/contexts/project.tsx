import { useQuery } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { supabase } from "@/lib/supabase";
import type { Project } from "@/lib/database.types";
import { useAuth } from "./auth";

const STORAGE_KEY = "wte-current-project-id";

type ProjectState = {
  current: Project | null;
  projects: Project[];
  loading: boolean;
  setCurrent: (id: string) => void;
};

const ProjectContext = createContext<ProjectState | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const [currentId, setCurrentId] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((id) => {
      if (id) setCurrentId(id);
    });
  }, []);

  const projectsQuery = useQuery({
    enabled: !!session,
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const projects = projectsQuery.data ?? [];
  const current =
    projects.find((p) => p.id === currentId) ?? projects[0] ?? null;

  function setCurrent(id: string) {
    setCurrentId(id);
    AsyncStorage.setItem(STORAGE_KEY, id);
  }

  return (
    <ProjectContext.Provider
      value={{ current, projects, loading: projectsQuery.isLoading, setCurrent }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error("useProject must be used within ProjectProvider");
  return ctx;
}
