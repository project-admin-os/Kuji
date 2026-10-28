import { lazy, Suspense, type ComponentType } from "react";
import { LandingPage } from "@/features/landing/LandingPage";
import { usePath } from "@/shared/router";

const MenuFeature = lazy(() =>
  import("@/features/menu/Feature").then((module) => ({ default: module.MenuFeature })),
);

const routes: Record<string, ComponentType> = {
  "/": LandingPage,
  "/menu": MenuFeature,
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

  return Page ? (
    <Suspense fallback={<main className="grid min-h-dvh place-items-center text-small text-navy/60" role="status">Loading…</main>}>
      <Page />
    </Suspense>
  ) : (
    <main className="p-4">{path}</main>
  );
}
