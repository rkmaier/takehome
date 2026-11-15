import { median, mode } from "../stats.ts";
import { convert, unitLabel, useUnits, type Quantity } from "../units.ts";

export type WeatherRow = {
  key: string;
  label: string;
  minTemp: number | null;
  maxTemp: number | null;
  avgTemp: number | null;
  precipitation: number | null;
};

type Column = {
  field: "minTemp" | "maxTemp" | "avgTemp" | "precipitation";
  title: string;
  quantity: Quantity;
};

const columns: Column[] = [
  { field: "minTemp", title: "Minimum hőmérséklet", quantity: "temperature" },
  { field: "maxTemp", title: "Maximum hőmérséklet", quantity: "temperature" },
  { field: "avgTemp", title: "Átlaghőmérséklet", quantity: "temperature" },
  { field: "precipitation", title: "Csapadék", quantity: "precipitation" },
];

const numberFormat = new Intl.NumberFormat("hu-HU", {
  maximumFractionDigits: 2,
});

function formatValue(value: number | null, unit: string): string {
  return value === null ? "–" : `${numberFormat.format(value)} ${unit}`;
}

function formatMode(values: number[], unit: string): string {
  if (values.length === 0) return "nincs";
  const shown = values.slice(0, 3).map((v) => formatValue(v, unit));
  return values.length > 3 ? `${shown.join(", ")} …` : shown.join(", ");
}

type Props = {
  labelTitle: string;
  rows: WeatherRow[];
};

export function WeatherTable({ labelTitle, rows }: Props) {
  const { system } = useUnits();

  if (rows.length === 0) {
    return (
      <p className="rounded-lg bg-slate-100 p-4 text-slate-600">
        A megadott időszakra nincs adat.
      </p>
    );
  }

  // A statisztikákat a metrikus (API) értékeken számoljuk, és csak a
  // megjelenítéskor váltunk át – az átváltás monoton és lineáris, így a
  // medián és a módusz ugyanaz marad, de a kerekítés nem torzítja a móduszt.
  const show = (value: number | null, c: Column) =>
    formatValue(
      convert(value, c.quantity, system),
      unitLabel(system, c.quantity),
    );

  const footer = [
    {
      title: "Medián",
      render: (c: Column) => show(median(rows.map((r) => r[c.field])), c),
    },
    {
      title: "Módusz",
      render: (c: Column) =>
        formatMode(
          mode(rows.map((r) => r[c.field])).map(
            (v) => convert(v, c.quantity, system) as number,
          ),
          unitLabel(system, c.quantity),
        ),
    },
  ];

  return (
    <div className="max-h-[65vh] overflow-auto rounded-lg border border-slate-200 shadow-sm">
      <table className="w-full border-collapse text-sm">
        <thead className="sticky top-0 bg-slate-800 text-left text-white">
          <tr>
            <th className="px-4 py-3 font-semibold">{labelTitle}</th>
            {columns.map((c) => (
              <th key={c.field} className="px-4 py-3 text-right font-semibold">
                {c.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.key}
              className="border-t border-slate-100 odd:bg-white even:bg-slate-50 hover:bg-sky-50"
            >
              <td className="px-4 py-2 font-medium whitespace-nowrap text-slate-700">
                {row.label}
              </td>
              {columns.map((c) => (
                <td
                  key={c.field}
                  className="px-4 py-2 text-right tabular-nums whitespace-nowrap"
                >
                  {show(row[c.field], c)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot className="sticky bottom-0 bg-slate-100 font-semibold text-slate-800">
          {footer.map((f) => (
            <tr key={f.title} className="border-t border-slate-300">
              <td className="px-4 py-2">{f.title}</td>
              {columns.map((c) => (
                <td key={c.field} className="px-4 py-2 text-right tabular-nums">
                  {f.render(c)}
                </td>
              ))}
            </tr>
          ))}
        </tfoot>
      </table>
    </div>
  );
}
