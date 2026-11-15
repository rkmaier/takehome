const baseUrl = import.meta.env.VITE_API_URL;

export type City = {
  id: number;
  name: string;
  region: string;
};

export type CityDay = {
  id: number;
  name: string;
  date: string;
  maxTemp: number | null;
  minTemp: number | null;
  avgTemp: number | null;
  precipitation: number | null;
};

export type RegionDay = {
  date: string;
  cityCount: number;
  minTemp: number | null;
  maxTemp: number | null;
  avgTemp: number | null;
  avgPrecipitation: number | null;
};

/** "2023-01-31" (date input) -> "20230131" (API) */
function toApiDate(isoDate: string): string {
  return isoDate.replaceAll("-", "");
}

async function getJson<T>(
  path: string,
  params?: Record<string, string>,
): Promise<T> {
  const query = params ? `?${new URLSearchParams(params)}` : "";
  const res = await fetch(`${baseUrl}${path}${query}`);
  if (!res.ok) {
    let message = `${res.status} ${res.statusText}`;
    try {
      const body = (await res.json()) as { error?: string };
      if (body.error) message = body.error;
    } catch {
      // nem JSON válasz, marad a státusz szöveg
    }
    throw new Error(message);
  }
  return (await res.json()) as T;
}

export function fetchCities(): Promise<City[]> {
  return getJson<City[]>("/cities");
}

export function fetchCityData(
  cityId: number,
  startDate: string,
  endDate: string,
): Promise<CityDay[]> {
  return getJson<CityDay[]>("/city", {
    id: String(cityId),
    startDate: toApiDate(startDate),
    endDate: toApiDate(endDate),
  });
}

export function fetchRegionData(
  region: string,
  startDate: string,
  endDate: string,
): Promise<RegionDay[]> {
  return getJson<RegionDay[]>("/region", {
    name: region,
    startDate: toApiDate(startDate),
    endDate: toApiDate(endDate),
  });
}
