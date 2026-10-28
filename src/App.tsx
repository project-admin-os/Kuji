import { lazy, Suspense, type ComponentType } from "react";
import { LandingPage } from "@/features/landing/LandingPage";
import { usePath } from "@/shared/router";

const routes: Record<string, ComponentType> = {
  "/": LandingPage,
};

const AdminPage = lazy(() =>
  import("@/features/admin/AdminPage").then((module) => ({
    default: module.AdminPage,
  })),
);

const isAdminPath = (path: string) =>
  path === "/admin" || path.startsWith("/admin/");

export default function App() {
  const path = usePath();

  if (isAdminPath(path)) {
    return (
      <Suspense fallback={null}>
        <AdminPage />
      </Suspense>
    );
  }

  const Page = routes[path];

  // Temporary: shows the path for pages that are not built yet.
  return Page ? <Page /> : <main className="p-4">{path}</main>;
}
