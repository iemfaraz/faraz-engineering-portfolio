import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { portfolioApi as base44 } from "@/lib/portfolio-api";

const MediaContext = createContext({
  introVideo: null,
  sheetCover: null,
  drawings: [],
  projectCovers: {},
  projectVideos: {},
  cv: null,
  cvAr: null,
  refreshMedia: async () => {},
});

export function MediaProvider({ children }) {
  const [items, setItems] = useState([]);
  const [cvAr, setCvAr] = useState(null);

  const refreshMedia = useCallback(async () => {
    try {
      const [page, versions] = await Promise.all([
        base44.entities.MediaItem.list({ sort: "order", limit: 100 }),
        base44.entities.CvVersion.list({ limit: 1 }).catch(() => null),
      ]);
      setItems(page?.items ?? []);
      setCvAr(versions?.items?.[0] ?? null);
    } catch {
      /* keep whatever is already loaded */
    }
  }, []);

  useEffect(() => {
    refreshMedia();
  }, [refreshMedia]);

  const value = useMemo(
    () => ({
      introVideo: items.find((item) => item.kind === "intro_video") ?? null,
      sheetCover: items.find((item) => item.kind === "drawing_cover") ?? null,
      cv: items.find((item) => item.kind === "cv") ?? null,
      cvAr,
      projectFiles: items.filter(item => item.kind === 'project_file'),
      drawings: items.filter((item) => item.kind === "drawing"),
      projectCovers: items.reduce((map, item) => {
        if (item.kind === "project_cover" && item.slug) map[item.slug] = item;
        return map;
      }, {}),
      projectVideos: items.reduce((map, item) => {
        if (item.kind === "project_video" && item.slug) map[item.slug] = item;
        return map;
      }, {}),
      refreshMedia,
    }),
    [items, cvAr, refreshMedia],
  );

  return <MediaContext.Provider value={value}>{children}</MediaContext.Provider>;
}

export function useMedia() {
  return useContext(MediaContext);
}