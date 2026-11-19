import React from "react";
import { Button } from "../ui/Button";

const FIELDS = [
  { key: "name",     label: "Tytuł ogłoszenia",                  type: "text",   required: true,  maxLength: 80,  min: undefined,  max: undefined },
  { key: "location", label: "Lokalizacja (miasto lub dzielnica)", type: "text",   required: false, maxLength: 120, min: undefined,  max: undefined },
  { key: "price",    label: "Cena (zł)",                         type: "number", required: true,  maxLength: undefined, min: 1,  max: 9999999999 },
  { key: "minutes",  label: "Dojazd (min)",                      type: "number", required: true,  maxLength: undefined, min: 0,  max: 1440 },
  { key: "area_m2",  label: "Powierzchnia (m²)",                 type: "number", required: false, maxLength: undefined, min: 1,  max: 9999, step: "0.01" },
  { key: "floor",    label: "Piętro",                            type: "number", required: false, maxLength: undefined, min: -2, max: 200 },
  { key: "rooms",    label: "Liczba pokoi",                      type: "number", required: false, maxLength: undefined, min: 1,  max: 20 },
];

export const blankOffer = { name: "", location: "", price: "", minutes: "", area_m2: "", floor: "", rooms: "" };

/**
 * Form for adding or editing an offer. Controlled via `value` / `onChange`.
 *
 * @param {{ value: object, onChange: (v: object) => void, onSubmit: (e) => void, busy: boolean }} props
 */
export function OfferForm({ value = blankOffer, onChange, onSubmit, busy }) {
  return (
    <form onSubmit={onSubmit}>
      {FIELDS.map(({ key, label, type, required, maxLength, min, max, step }) => (
        <label key={key}>
          {label}
          <input
            required={required}
            type={type}
            maxLength={maxLength}
            min={min}
            max={max}
            step={step}
            value={value[key] ?? ""}
            onChange={(e) => onChange({ ...value, [key]: e.target.value })}
          />
        </label>
      ))}
      <Button variant="primary" disabled={busy}>
        Zapisz ogłoszenie
      </Button>
    </form>
  );
}
