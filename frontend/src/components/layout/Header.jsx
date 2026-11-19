import React from "react";
import { Home } from "lucide-react";

/**
 * Top navigation bar with branding and action buttons.
 *
 * @param {{ onAddOffer: () => void, onPreferences: () => void, canPreferences: boolean }} props
 */
export function Header({ onAddOffer, onPreferences, canPreferences }) {
  return (
    <header>
      <div className="bar">
        <a className="brand" href="#" aria-label="Twoje Mieszkanie — początek">
          <span className="logo">
            <Home size={18} color="white" />
          </span>
          Twoje<span>Mieszkanie</span>
        </a>
        <div className="actions">
          <button className="outline" onClick={onAddOffer}>
            ＋ Dodaj ogłoszenie
          </button>
          <button
            className="circle"
            title="Profil preferencji"
            aria-label="Otwórz profil preferencji"
            disabled={!canPreferences}
            onClick={onPreferences}
          >
            <svg
              width="21"
              height="21"
              viewBox="0 0 24 24"
              aria-hidden="true"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="8" r="3.5" />
              <path d="M4 21a8 8 0 0 1 16 0" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
