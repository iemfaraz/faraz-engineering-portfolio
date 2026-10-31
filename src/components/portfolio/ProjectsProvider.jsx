import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useLang } from "@/components/portfolio/LanguageProvider";
import { mergeProjects } from "@/lib/project-list";

const ProjectsContext = createContext({ items: [], extra: [], refreshProjects: async () => {} });

export function ProjectsProvider({ children }) {
  const { lang, c } = useLang();
  const [extra, setExtra] = useState([]);

  const refreshProjects = useCallback(async () => {
    try {
      const page = await base44.entities.Project.list({ sort: "order", limit: 200 });
      setExtra(page?.items ?? []);
    } catch {
      /* keep whatever is already loaded */
    }
  }, []);

  useEffect(() => {
    refreshProjects();
  }, [refreshProjects]);

  const value = useMemo(
    () => ({
      items: mergeProjects(c.projects.items, extra, lang, c.projects.filters),
      extra,
      refreshProjects,
    }),
    [c.projects.items, c.projects.filters, extra, lang, refreshProjects],
  );

  return <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>;
}

export function useProjects() {
  return useContext(ProjectsContext);
}