import { useMemo, useState } from "react";
import { getRouteApi } from "@tanstack/react-router";
import { fetchRegionData } from "../api.ts";
import { Field, QueryForm } from "../components/QueryForm.tsx";
import { inputClass } from "../components/formStyles.ts";
import { formatDate } from "../format.ts";
import { WeatherTable, type WeatherRow } from "../components/WeatherTable.tsx";

const route = getRouteApi("/region");

export function RegionPage() {
  const cities = route.useLoaderData();
  const regions = useMemo(
    () =>
      [...new Set(cities.map((c) => c.region))].sort((a, b) =>
        a.localeCompare(b, "hu"),
      ),
    [cities],
  );

  const [region, setRegion] = useState<string>(regions[0] ?? "");
  const [rows, setRows] = useState<WeatherRow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async (startDate: string, endDate: string) => {
    setLoading(true);
    setError(null);
    try {
      const days = await fetchRegionData(region, startDate, endDate);
      setRows(
        days.map((d) => ({
          key: d.date,
          label: formatDate(d.date),
          minTemp: d.minTemp,
          maxTemp: d.maxTemp,
          avgTemp: d.avgTemp,
          precipitation: d.avgPrecipitation,
        })),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setRows(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-slate-800">
        Régió átlagolt időjárása
      </h1>
      <QueryForm
        loading={loading}
        onSubmit={load}
        selector={
          <Field label="Régió" htmlFor="region">
            <select
              id="region"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className={inputClass}
            >
              {regions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </Field>
        }
      />
      {error && (
        <p className="rounded-lg bg-red-50 p-4 text-red-700">Hiba: {error}</p>
      )}
      {rows && (
        <>
          <WeatherTable labelTitle="Dátum" rows={rows} />
          <p className="text-sm text-slate-500">
            A minimum és maximum a régió adott napi legalacsonyabb és
            legmagasabb mért értéke. Az átlaghőmérséklet a városok minimum- és
            maximum hőmérsékletéből számolódik, a csapadék a városok átlaga.
          </p>
        </>
      )}
    </section>
  );
}
