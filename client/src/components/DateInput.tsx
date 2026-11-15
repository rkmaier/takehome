import { useRef } from "react";
import { isValidIsoDate } from "../format.ts";
import { inputClass } from "./formStyles.ts";

type Props = {
  id: string;
  value: string;
  min: string;
  max: string;
  onChange: (value: string) => void;
};

/**
 * Dátummező, ami mindig YYYY-MM-DD formában jelenik meg (a natív
 * `<input type="date">` a böngésző nyelvi beállítása szerint formáz).
 * Gépelhető, a naptár gomb pedig a böngésző saját dátumválasztóját nyitja meg.
 */
export function DateInput({ id, value, min, max, onChange }: Props) {
  const pickerRef = useRef<HTMLInputElement>(null);

  const openPicker = () => {
    const picker = pickerRef.current;
    if (!picker) return;
    try {
      picker.showPicker();
    } catch {
      picker.focus();
    }
  };

  return (
    <div className="relative">
      <input
        id={id}
        type="text"
        inputMode="numeric"
        placeholder="ÉÉÉÉ-HH-NN"
        maxLength={10}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputClass} pr-10 tabular-nums`}
      />
      <button
        type="button"
        onClick={openPicker}
        aria-label="Dátumválasztó megnyitása"
        className="absolute inset-y-0 right-0 flex w-10 cursor-pointer items-center justify-center text-slate-500 hover:text-sky-600"
      >
        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      {/* Láthatatlan natív mező, csak a naptár felugróablakhoz. */}
      <input
        ref={pickerRef}
        type="date"
        tabIndex={-1}
        aria-hidden="true"
        min={min}
        max={max}
        value={isValidIsoDate(value) ? value : ""}
        onChange={(e) => onChange(e.target.value)}
        className="pointer-events-none absolute right-0 bottom-0 h-0 w-0 opacity-0"
      />
    </div>
  );
}
