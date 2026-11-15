import { Link, Outlet, type ErrorComponentProps } from "@tanstack/react-router";
import { UnitProvider, UnitToggle } from "./UnitToggle.tsx";

const navLinkClass =
  "rounded-md px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-700 hover:text-white";

export function RootLayout() {
  return (
    <UnitProvider>
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <header className="bg-slate-800 shadow">
          <nav className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3">
            <span className="mr-4 text-lg font-bold text-white">Időjárás</span>
            <Link
              to="/city"
              className={navLinkClass}
              activeProps={{ className: "bg-sky-600 text-white" }}
            >
              Város
            </Link>
            <Link
              to="/region"
              className={navLinkClass}
              activeProps={{ className: "bg-sky-600 text-white" }}
            >
              Régió
            </Link>
            <div className="ml-auto">
              <UnitToggle />
            </div>
          </nav>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8">
          <Outlet />
        </main>
      </div>
    </UnitProvider>
  );
}

export function ErrorView({ error }: ErrorComponentProps) {
  const message = error instanceof Error ? error.message : String(error);
  return (
    <p className="rounded-lg bg-red-50 p-4 text-red-700">
      Hiba az adatok betöltésekor: {message}
    </p>
  );
}
