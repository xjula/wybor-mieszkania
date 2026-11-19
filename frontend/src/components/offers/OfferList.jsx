import React from "react";
import { OfferCard } from "./OfferCard";
import { cash, fold } from "../../utils/format";

/**
 * Filtered list of offer cards with a summary line and "clear" button.
 *
 * @param {{ offers: object[], query: object, busy: boolean, onEdit: fn, onDelete: fn, onClearQuery: fn }} props
 */
export function OfferList({ offers, query, busy, onEdit, onDelete, onClearQuery }) {
  const view = (offers || []).filter((o) => {
    if (query.location.trim() && !fold(o.location).includes(fold(query.location.trim()))) return false;
    if (query.max && o.price > Number(query.max)) return false;
    if (query.minArea && (o.area_m2 == null || o.area_m2 < Number(query.minArea))) return false;
    if (query.floor !== "" && query.floor != null && o.floor !== Number(query.floor)) return false;
    if (query.minRooms && (o.rooms == null || o.rooms < Number(query.minRooms))) return false;
    return true;
  });

  const hasFilters =
    query.location || query.max || query.minArea || query.floor !== "" || query.minRooms;

  return (
    <>
      <p className="summary">
        {view.length} z {offers.length} ofert
        {query.location.trim() && " · " + query.location.trim()}
        {query.max && " · do " + cash(+query.max)}
        {query.minArea && " · min. " + query.minArea + " m²"}
        {query.floor !== "" && query.floor != null && " · " + query.floor + ". piętro"}
        {query.minRooms && " · min. " + query.minRooms + " pok."}{" "}
        {hasFilters && (
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
