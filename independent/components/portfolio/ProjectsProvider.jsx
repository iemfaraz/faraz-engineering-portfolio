import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { portfolioApi as base44 } from "@/lib/portfolio-api";
import { useLang } from "@/components/portfolio/LanguageProvider";
import { mergeProjects } from "@/lib/project-list";

const ProjectsContext = createContext({ items: [], extra: [], refreshProjects: async () => {} });

export function ProjectsProvider({ children }) {
  const { lang, c } = useLang();
  const [extra, setExtra] = useState(null);

  const refreshProjects = useCallback(async () => {
    try {
      const page = await base44.entities.Project.list({ sort: "order", limit: 200 });
      setExtra(page.initialized ? (page?.items ?? []) : null);
    } catch {
      /* keep whatever is already loaded */
    }
  }, []);

  useEffect(() => {
    refreshProjects();
  }, [refreshProjects]);

  const value = useMemo(
    () => ({
      items: extra === null ? c.projects.items : mergeProjects([], extra, lang, c.projects.filters),
      extra: extra ?? [],
      refreshProjects,
    }),
    [c.projects.items, c.projects.filters, extra, lang, refreshProjects],
  );

  return <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>;
}

export function useProjects() {
  return useContext(ProjectsContext);
}