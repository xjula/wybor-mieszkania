import React from "react";
import { useState } from "react";
import { MapPin, SlidersHorizontal, Search } from "lucide-react";

const initial = { location: "", max: "", time: "" };

/**
 * Hero search section with location input, filters toggle and submit.
 *
 * @param {{ onSearch: (query: { location: string, max: string, time: string }) => void }} props
 */
export function SearchBar({ onSearch }) {
  const [draft, setDraft] = useState(initial);
  const [filtersOpen, setFiltersOpen] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    onSearch({ ...draft });
    setFiltersOpen(false);
  }

  return (
    <section className="hero">
      <div className="eyebrow">NIERUCHOMOŚCI NA SPRZEDAŻ</div>
      <h1>
        Znajdź swoje <em>mieszkanie.</em>
      </h1>
      <p>
        Wybierz lokalizację, porównaj oferty i sprawdź, która najlepiej
        odpowiada Twoim potrzebom.
      </p>
      <form onSubmit={handleSubmit} className="searchform">
        <div className="searchbar">
          <label className="location">
            <MapPin size={18} />
            <span>
              <small>Lokalizacja</small>
              <input
                aria-label="Lokalizacja"
                placeholder="Miasto lub dzielnica"
                value={draft.location}
                onChange={(e) =>
                  setDraft({ ...draft, location: e.target.value })
                }
              />
            </span>
          </label>
          <button
            type="button"
            className="filter"
            aria-expanded={filtersOpen}
            onClick={() => setFiltersOpen((v) => !v)}
          >
            <SlidersHorizontal size={16} /> Filtry
            {draft.max || draft.time ? " •" : ""}
          </button>
          <button className="primary search">
            <Search size={16} />
            Szukaj
          </button>
        </div>
        {filtersOpen && (
          <FilterPanel
            draft={draft}
            onChange={(patch) => setDraft({ ...draft, ...patch })}
          />
        )}
      </form>
    </section>
  );
}

/**
 * Collapsible filter panel (price cap + commute cap).
 *
 * @param {{ draft: object, onChange: (patch: object) => void }} props
 */
export function FilterPanel({ draft, onChange }) {
  return (
    <div className="filterpanel">
      <label>
        Cena do (zł)
        <input
          type="number"
          min="1"
          value={draft.max}
          onChange={(e) => onChange({ max: e.target.value })}
        />
      </label>
      <label>
        Dojazd do (min)
        <input
          type="number"
          min="0"
          value={draft.time}
          onChange={(e) => onChange({ time: e.target.value })}
        />
      </label>
    </div>
  );
}
