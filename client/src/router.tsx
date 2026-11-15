import {
  createHashHistory,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";
import { fetchCities } from "./api.ts";
import { ErrorView, RootLayout } from "./components/Layout.tsx";
import { CityPage } from "./pages/CityPage.tsx";
import { RegionPage } from "./pages/RegionPage.tsx";

const rootRoute = createRootRoute({
  component: RootLayout,
  errorComponent: ErrorView,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: () => {
    throw redirect({ to: "/city" });
  },
});

const cityRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/city",
  loader: fetchCities,
  component: CityPage,
});

const regionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/region",
  loader: fetchCities,
  component: RegionPage,
});

const routeTree = rootRoute.addChildren([indexRoute, cityRoute, regionRoute]);

// Hash history: a prod nginx nem irányít vissza minden útvonalat az
// index.html-re, így a /#/city formájú URL-ek frissítéskor is működnek.
export const router = createRouter({
  routeTree,
  history: createHashHistory(),
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
