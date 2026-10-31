import { useMedia } from "@/components/portfolio/MediaProvider";

export const DEFAULT_CV_URL = "/assets/Faraz_Nawaz_CV.pdf";

// The CV uploaded from the dashboard, or the file shipped with the site.
export function useCvUrl() {
  const { cv } = useMedia();
  return cv?.url || DEFAULT_CV_URL;
}