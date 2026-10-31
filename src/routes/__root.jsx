import { HeadContent, Outlet, Scripts, createRootRoute } from "@tanstack/react-router";
import { DefaultCatchBoundary } from "@/components/DefaultCatchBoundary";
import { NotFound } from "@/components/NotFound";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/AuthContext";
import { LanguageProvider } from "@/components/portfolio/LanguageProvider";
import { MediaProvider } from "@/components/portfolio/MediaProvider";
import { ProjectsProvider } from "@/components/portfolio/ProjectsProvider";
import { ThemeProvider } from "@/components/portfolio/ThemeProvider";
import { Base44Scripts } from "base44:document";
import appCss from "@/index.css?url";

export const Route = createRootRoute({
  // Per-page <title>/meta come from each route's head(); this is the shared base.
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Faraz Nawaz — Electrical & BIM Engineer, Riyadh" },
      {
        name: "description",
        content:
          "Electrical engineer in Riyadh delivering power, lighting and ELV design to SBC and IEC, and following it onto site through installation, inspection and closeout.",
      },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "Faraz Nawaz — Electrical & BIM Engineer" },
      {
        property: "og:description",
        content:
          "Power, lighting and ELV design for government, commercial and residential projects in Saudi Arabia. Designed to be installed, not just approved.",
      },
      { property: "og:image", content: "/assets/og-image.jpg" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "/assets/og-image.jpg" },
      { name: "theme-color", content: "#F4F2EE" },
    ],
    // No icon link: the platform adds the app's logo when serving.
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&family=Inter+Tight:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&family=Space+Grotesk:wght@400;500;600;700&display=swap",
      },
      { rel: "stylesheet", href: appCss },
    ],
  }),
  errorComponent: DefaultCatchBoundary,
  notFoundComponent: () => <NotFound />,
  shellComponent: RootDocument,
  component: RootComponent,
});

function RootComponent() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LanguageProvider>
          <MediaProvider>
            <ProjectsProvider>
              <Outlet />
            </ProjectsProvider>
          </MediaProvider>
          <Toaster />
        </LanguageProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

// The document. There is no index.html: the server renders <html> from here.
function RootDocument({ children }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      {/* data-react-root: the builder's preview bridge looks for #root and falls back to this. */}
      <body data-react-root="true">
        {children}
        <Base44Scripts />
        <Scripts />
      </body>
    </html>
  );
}