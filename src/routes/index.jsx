import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import Nav from "@/components/portfolio/Nav";
import Hero from "@/components/portfolio/Hero";
import Stats from "@/components/portfolio/Stats";
import Profile from "@/components/portfolio/Profile";
import Intent from "@/components/portfolio/Intent";
import Expertise from "@/components/portfolio/Expertise";
import Projects from "@/components/portfolio/Projects";
import Sheets from "@/components/portfolio/Sheets";
import Experience from "@/components/portfolio/Experience";
import Films from "@/components/portfolio/Films";
import Recommendations from "@/components/portfolio/Recommendations";
import Toolkit from "@/components/portfolio/Toolkit";
import LinkedIn from "@/components/portfolio/LinkedIn";
import Contact from "@/components/portfolio/Contact";
import Crosshair from "@/components/portfolio/Crosshair";
import { getApprovedRecommendations, submitRecommendation } from "@/lib/server-fns";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Faraz Nawaz — Electrical & BIM Engineer, Riyadh" },
      {
        name: "description",
        content:
          "Electrical engineer in Riyadh delivering power, lighting and ELV design to SBC and IEC, and following it onto site through installation, inspection and closeout.",
      },
    ],
  }),
  loader: () => getApprovedRecommendations(),
  component: Home,
});

function Home() {
  const recommendations = Route.useLoaderData();
  const submit = useServerFn(submitRecommendation);

  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Stats />
        <Profile />
        <Intent />
        <Expertise />
        <Projects />
        <Sheets />
        <Experience />
        <Films />
        <Recommendations items={recommendations} onSubmit={(values) => submit({ data: values })} />
        <Toolkit />
        <LinkedIn />
        <Contact />
      </main>
      <Crosshair />
    </>
  );
}