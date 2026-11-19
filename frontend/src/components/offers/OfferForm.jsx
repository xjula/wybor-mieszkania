import React from "react";
import { Button } from "../ui/Button";

const FIELDS = [
  {
    key: "name",
    label: "Tytuł ogłoszenia",
    type: "text",
    required: true,
    maxLength: 80,
    min: undefined,
    max: undefined,
  },
  {
    key: "location",
    label: "Lokalizacja (miasto lub dzielnica)",
    type: "text",
    required: false,
    maxLength: 120,
    min: undefined,
    max: undefined,
  },
  {
    key: "price",
    label: "Cena (zł)",
    type: "number",
    required: true,
    maxLength: undefined,
    min: 1,
    max: 9999999999,
  },
  {
    key: "minutes",
    label: "Dojazd (min)",
    type: "number",
    required: true,
    maxLength: undefined,
    min: 0,
    max: 1440,
  },
];

const blank = { name: "", location: "", price: "", minutes: "" };

/**
 * Form for adding or editing an offer. Controlled via `value` / `onChange`.
 *
 * @param {{ value: object, onChange: (v: object) => void, onSubmit: (e) => void, busy: boolean }} props
 */
export function OfferForm({ value = blank, onChange, onSubmit, busy }) {
  return (
    <form onSubmit={onSubmit}>
      {FIELDS.map(({ key, label, type, required, maxLength, min, max }) => (
        <label key={key}>
          {label}
          <input
            required={required}
            type={type}
            maxLength={maxLength}
            min={min}
            max={max}
            value={value[key]}
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
