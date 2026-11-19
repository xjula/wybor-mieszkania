import React from "react";
import { OfferCard } from "./OfferCard";
import { cash, fold } from "../../utils/format";

/**
 * Filtered list of offer cards with a summary line and "clear" button.
 *
 * @param {{ offers: object[], query: object, busy: boolean, onEdit: fn, onDelete: fn, onClearQuery: fn }} props
 */
export function OfferList({
  offers,
  query,
  busy,
  onEdit,
  onDelete,
  onClearQuery,
}) {
  const view = (offers || []).filter(
    (o) =>
      fold(o.location).includes(fold(query.location.trim())) &&
      (!query.max || o.price <= Number(query.max)) &&
      (!query.time || o.minutes <= Number(query.time)),
  );

  return (
    <>
      <p className="summary">
        {view.length} z {offers.length} ofert
        {query.location.trim() && " · " + query.location.trim()}
        {query.max && " · do " + cash(+query.max)}
        {query.time && " · do " + query.time + " min"}{" "}
        {(query.location || query.max || query.time) && (
          <button className="link" onClick={onClearQuery}>
            Wyczyść wyszukiwanie
          </button>
        )}
      </p>
      <div className="cards">
        {view.map((o) => (
          <OfferCard
            key={o.id}
            offer={o}
            busy={busy}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
      {!view.length && (
        <p>
          {offers.length
            ? "Brak mieszkań pasujących do wyszukiwania."
            : "Nie masz jeszcze ogłoszeń. Dodaj pierwsze mieszkanie."}
        </p>
      )}
    </>
  );
}
