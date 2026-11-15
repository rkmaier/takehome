import { useState } from "react";
import { getRouteApi } from "@tanstack/react-router";
import { fetchCityData } from "../api.ts";
import { Field, QueryForm } from "../components/QueryForm.tsx";
import { inputClass } from "../components/formStyles.ts";
import { formatDate } from "../format.ts";
import { WeatherTable, type WeatherRow } from "../components/WeatherTable.tsx";

const route = getRouteApi("/city");

export function CityPage() {
  const cities = route.useLoaderData();
  const [cityId, setCityId] = useState<number>(cities[0]?.id ?? 0);
  const [rows, setRows] = useState<WeatherRow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async (startDate: string, endDate: string) => {
    setLoading(true);
    setError(null);
    try {
      const days = await fetchCityData(cityId, startDate, endDate);
      setRows(
        days.map((d) => ({
          key: d.date,
          label: formatDate(d.date),
          minTemp: d.minTemp,
          maxTemp: d.maxTemp,
          avgTemp: d.avgTemp,
          precipitation: d.precipitation,
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
      <h1 className="text-2xl font-bold text-slate-800">Város időjárása</h1>
      <QueryForm
        loading={loading}
        onSubmit={load}
        selector={
          <Field label="Város" htmlFor="city">
            <select
              id="city"
              value={cityId}
              onChange={(e) => setCityId(Number(e.target.value))}
              className={inputClass}
            >
              {cities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.region})
                </option>
              ))}
            </select>
          </Field>
        }
      />
      {error && (
        <p className="rounded-lg bg-red-50 p-4 text-red-700">Hiba: {error}</p>
      )}
      {rows && <WeatherTable labelTitle="Dátum" rows={rows} />}
    </section>
  );
}
