import { useEffect, useState, type ReactNode } from "react";
import {
  readStored,
  STORAGE_KEY,
  UnitContext,
  useUnits,
  type UnitSystem,
} from "../units.ts";

export function UnitProvider({ children }: { children: ReactNode }) {
  const [system, setSystem] = useState<UnitSystem>(readStored);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, system);
    } catch {
      // pl. privát mód – ilyenkor csak nem jegyezzük meg a választást
    }
  }, [system]);

  return (
    <UnitContext.Provider value={{ system, setSystem }}>
      {children}
    </UnitContext.Provider>
  );
}

const options: { value: UnitSystem; label: string; title: string }[] = [
  { value: "metric", label: "°C / mm", title: "Metrikus" },
  { value: "imperial", label: "°F / in", title: "Angolszász" },
];

/** Kétállású kapcsoló a mértékegység-rendszer váltásához. */
export function UnitToggle() {
  const { system, setSystem } = useUnits();
  return (
    <div
      role="radiogroup"
      aria-label="Mértékegység"
      className="flex rounded-md bg-slate-700 p-0.5"
    >
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={system === o.value}
          title={o.title}
          onClick={() => setSystem(o.value)}
          className={
            "rounded px-3 py-1.5 text-sm font-semibold " +
            (system === o.value
              ? "bg-sky-600 text-white"
              : "text-slate-300 hover:text-white")
          }
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
