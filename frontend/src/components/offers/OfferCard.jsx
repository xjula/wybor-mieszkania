import React from "react";
import { MapPin } from "lucide-react";
import { City } from "../City";
import { cash } from "../../utils/format";

/**
 * Single offer card.
 *
 * @param {{ offer: object, busy: boolean, onEdit: (o: object) => void, onDelete: (o: object) => void }} props
 */
export function OfferCard({ offer: o, busy, onEdit, onDelete }) {
  const details = [
    o.area_m2 != null && `${o.area_m2} m²`,
    o.floor != null && `${o.floor}. piętro`,
    o.rooms != null && `${o.rooms} pok.`,
  ].filter(Boolean).join(" · ");

  return (
    <article>
      <div className="art">
        <City variant={o.id - 1} />
        <span>Ilustracja</span>
      </div>
      <div className="pad">
        <small>
          <MapPin size={14} />
          {o.location || "Brak lokalizacji"}
        </small>
        <h3>{o.name}</h3>
        <strong className="price">{cash(o.price)}</strong>
        {details && <p className="offer-details">{details}</p>}
        <p>Dojazd: {o.minutes} min</p>
        <div className="cardactions">
          <button className="link" onClick={() => onEdit(o)}>
            Edytuj
          </button>
          <button
            className="link"
            disabled={busy}
            onClick={() => {
              if (confirm("Usunąć ofertę „" + o.name + "\"?")) onDelete(o);
            }}
          >
            Usuń
          </button>
        </div>
      </div>
    </article>
  );
}
