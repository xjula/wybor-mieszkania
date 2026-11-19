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
        <p>Dojazd: {o.minutes} min</p>
        <div className="cardactions">
          <button className="link" onClick={() => onEdit(o)}>
            Edytuj
          </button>
          <button
            className="link"
            disabled={busy}
            onClick={() => {
              if (confirm("Usunąć ofertę „" + o.name + '"?')) onDelete(o);
            }}
          >
            Usuń
          </button>
        </div>
      </div>
    </article>
  );
}
