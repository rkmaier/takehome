import { useState, type FormEvent, type ReactNode } from "react";

import { isValidIsoDate } from "../format.ts";
import { DateInput } from "./DateInput.tsx";

// Az adatbázisban található adatok időszaka.
const MIN_DATE = "1901-01-01";
const MAX_DATE = "2023-12-31";

export function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={htmlFor} className="text-sm font-semibold text-slate-700">
        {label}
      </label>
      {children}
    </div>
  );
}

type Props = {
  /** A város / régió választó mező. */
  selector: ReactNode;
  loading: boolean;
  onSubmit: (startDate: string, endDate: string) => void;
};

/** Közös űrlap: választó + kezdő- és végdátum + lekérdezés gomb. */
export function QueryForm({ selector, loading, onSubmit }: Props) {
  const [startDate, setStartDate] = useState("2023-01-01");
  const [endDate, setEndDate] = useState("2023-01-31");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      setError("A kezdő- és végdátum megadása kötelező.");
      return;
    }
    if (!isValidIsoDate(startDate) || !isValidIsoDate(endDate)) {
      setError("A dátumot ÉÉÉÉ-HH-NN formában add meg (pl. 2023-01-31).");
      return;
    }
    if (startDate < MIN_DATE || endDate > MAX_DATE) {
      setError(`Adat csak ${MIN_DATE} és ${MAX_DATE} között érhető el.`);
      return;
    }
    if (startDate > endDate) {
      setError("A kezdődátum nem lehet későbbi a végdátumnál.");
      return;
    }
    setError(null);
    onSubmit(startDate, endDate);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-[2fr_1fr_1fr_auto] sm:items-end"
    >
      {selector}
      <Field label="Kezdődátum" htmlFor="start-date">
        <DateInput
          id="start-date"
          min={MIN_DATE}
          max={MAX_DATE}
          value={startDate}
          onChange={setStartDate}
        />
      </Field>
      <Field label="Végdátum" htmlFor="end-date">
        <DateInput
          id="end-date"
          min={MIN_DATE}
          max={MAX_DATE}
          value={endDate}
          onChange={setEndDate}
        />
      </Field>
      <button
        type="submit"
        disabled={loading}
        className="cursor-pointer rounded-md bg-sky-600 px-5 py-2 font-semibold text-white shadow-sm hover:bg-sky-700 active:bg-sky-800 disabled:cursor-wait disabled:opacity-60"
      >
        {loading ? "Betöltés…" : "Lekérdezés"}
      </button>
      {error && <p className="text-sm text-red-600 sm:col-span-4">{error}</p>}
    </form>
  );
}
