import React from "react";
import { cash, points } from "../../utils/format";

/**
 * SAW ranking panel showing scored offers and excluded ones.
 *
 * @param {{ state: object, onChangePreferences: () => void }} props
 */
export function RankingList({ state: s, onChangePreferences }) {
  return (
    <div className="rank">
      <p>
        Ranking całej listy · Budżet {cash(s.budget)} · Cena {s.weight}% ·
        Dojazd {100 - s.weight}%{" "}
        <button className="link" onClick={onChangePreferences}>
          Zmień preferencje
        </button>
      </p>
      {s.ranked.map((o) => (
        <details key={o.id}>
          <summary>
            {o.place}. {o.name} <b>{points(o.score)} pkt</b>
          </summary>
          <p>
            Cena {cash(o.price)} · dojazd {o.minutes} min. Po normalizacji:{" "}
            {points(o.p)} × {s.weight}% + {points(o.t)} × {100 - s.weight}% ≈{" "}
            {points(o.score)}.
          </p>
        </details>
      ))}
      {!s.ranked.length && <p>Brak ofert w budżecie.</p>}
      <h3>Pominięte oferty</h3>
      {s.excluded.length
        ? s.excluded.map((o) => (
            <p key={o.id}>
              {o.name}: ponad budżet o {cash(o.excess)}.
            </p>
          ))
        : "Brak."}
    </div>
  );
}
