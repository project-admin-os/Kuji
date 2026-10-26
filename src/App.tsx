import type { ComponentType } from "react";
import { LandingPage } from "@/features/landing/LandingPage";
import { usePath } from "@/shared/router";

// One line per page. Add new routes here as each feature is built.
const routes: Record<string, ComponentType> = {
  "/": LandingPage,
};

export default function App() {
  const path = usePath();
  const Page = routes[path];

  // Temporary: shows the path for pages that are not built yet.
  return Page ? <Page /> : <main className="p-4">{path}</main>;
}
