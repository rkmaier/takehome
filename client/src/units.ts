import { createContext, useContext } from "react";

/** Mértékegység-rendszer: metrikus (°C, mm) vagy angolszász (°F, inch). */
export type UnitSystem = "metric" | "imperial";

export type Quantity = "temperature" | "precipitation";

export const STORAGE_KEY = "unitSystem";

const unitLabels: Record<UnitSystem, Record<Quantity, string>> = {
  metric: { temperature: "°C", precipitation: "mm" },
  imperial: { temperature: "°F", precipitation: "in" },
};

export function unitLabel(system: UnitSystem, quantity: Quantity): string {
  return unitLabels[system][quantity];
}

/** Metrikus (API-ból jövő) érték átváltása a választott rendszerbe. */
export function convert(
  value: number | null,
  quantity: Quantity,
  system: UnitSystem,
): number | null {
  if (value === null || system === "metric") return value;
  return quantity === "temperature" ? (value * 9) / 5 + 32 : value / 25.4;
}

export function readStored(): UnitSystem {
  try {
    return localStorage.getItem(STORAGE_KEY) === "imperial"
      ? "imperial"
      : "metric";
  } catch {
    return "metric";
  }
}

export type UnitContextValue = {
  system: UnitSystem;
  setSystem: (system: UnitSystem) => void;
};

export const UnitContext = createContext<UnitContextValue>({
  system: "metric",
  setSystem: () => {},
});

export function useUnits(): UnitContextValue {
  return useContext(UnitContext);
}
