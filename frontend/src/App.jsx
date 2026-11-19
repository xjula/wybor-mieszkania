import React, { useEffect, useRef, useState } from "react";
import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import { SearchBar } from "./components/search/SearchBar";
import { OfferList } from "./components/offers/OfferList";
import { blankOffer, OfferForm } from "./components/offers/OfferForm";
import { RankingList } from "./components/ranking/RankingList";
import { Modal } from "./components/ui/Modal";
import { TabSwitch } from "./components/ui/TabSwitch";
import { Button } from "./components/ui/Button";
import { api } from "./utils/format";
import "./style.css";

const TABS = [
  ["offers", "Ogłoszenia"],
  ["ranking", "Ranking SAW"],
];

const emptyQuery = { location: "", max: "", minArea: "", floor: "", minRooms: "" };

export default function App() {
  const [state, setState] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Tabs
  const [tab, setTab] = useState("offers");

  // Search / filter query
  const [query, setQuery] = useState(emptyQuery);

  // Modal state: "" | "offer" | "prefs"
  const [modal, setModal] = useState("");
  const [editId, setEditId] = useState(null);
  const [offer, setOffer] = useState(blankOffer);
  const [pref, setPref] = useState({ budget: 500000, weight: 70 });

  const resultsRef = useRef(null);

  // ─── API helpers ────────────────────────────────────────────────────────────

  async function run(fn) {
    setError("");
    setBusy(true);
    try {
      return await fn();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function load() {
    return run(async () => {
      const data = await api("state");
      setState(data);
      return data;
    });
  }

  useEffect(() => { load(); }, []);

  // ─── Handlers ───────────────────────────────────────────────────────────────

  function openAddOffer() {
    setError("");
    setEditId(null);
    setOffer(blankOffer);
    setModal("offer");
  }

  function openEditOffer(o) {
    setError("");
    setEditId(o.id);
    setOffer({
      name: o.name,
      location: o.location || "",
      price: o.price,
      minutes: o.minutes,
      area_m2: o.area_m2 ?? "",
      floor: o.floor ?? "",
      rooms: o.rooms ?? "",
    });
    setModal("offer");
  }

  function openPreferences() {
    if (!state) return;
    setError("");
    setPref({ budget: state.budget, weight: state.weight });
    setModal("prefs");
  }

  function closeModal() {
    if (!busy) { setModal(""); setError(""); }
  }

  function handleSearch(q) {
    setQuery(q);
    setTab("offers");
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function handleDeleteOffer(o) {
    run(async () => {
      await api("offers/" + o.id, "DELETE");
      await load();
    });
  }

  async function handleSaveOffer(e) {
    e.preventDefault();
    run(async () => {
      await api(
        editId === null ? "offers" : "offers/" + editId,
        editId === null ? "POST" : "PUT",
        {
          name: offer.name.trim(),
          location: offer.location.trim(),
          price: Number(offer.price),
          minutes: Number(offer.minutes),
          area_m2: offer.area_m2 !== "" ? Number(offer.area_m2) : null,
          floor:   offer.floor   !== "" ? Number(offer.floor)   : null,
          rooms:   offer.rooms   !== "" ? Number(offer.rooms)   : null,
        },
      );
      await load();
      setModal("");
      setQuery(emptyQuery);
      setTab("offers");
      resultsRef.current?.scrollIntoView();
    });
  }

  async function handleSavePreferences(e) {
    e.preventDefault();
    run(async () => {
      await api("preferences", "PUT", {
        budget: Number(pref.budget),
        weight: Number(pref.weight),
      });
      await load();
      setModal("");
      setTab("ranking");
      resultsRef.current?.scrollIntoView();
    });
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <Header
        onAddOffer={openAddOffer}
        onPreferences={openPreferences}
        canPreferences={!!state}
      />

      <main>
        <SearchBar onSearch={handleSearch} />

        <section className="list" ref={resultsRef}>
          <div className="sectionhead">
            <div>
              <div className="eyebrow">TWOJA LISTA</div>
              <h2>{tab === "offers" ? "Mieszkania na sprzedaż" : "Ranking dopasowania"}</h2>
            </div>
            <TabSwitch tabs={TABS} active={tab} onChange={setTab} />
          </div>

          {!modal && error && (
            <p role="alert">
              {error}{" "}
              <button onClick={() => run(load)}>Spróbuj ponownie</button>
            </p>
          )}
          {!state && !error && <p>Wczytywanie ofert…</p>}

          {state && tab === "offers" && (
            <OfferList
              offers={state.offers}
              query={query}
              busy={busy}
              onEdit={openEditOffer}
              onDelete={handleDeleteOffer}
              onClearQuery={() => setQuery(emptyQuery)}
            />
          )}

          {state && tab === "ranking" && (
            <RankingList state={state} onChangePreferences={openPreferences} />
          )}
        </section>
      </main>

      <Footer />

      {modal && (
        <Modal
          close={closeModal}
          title={
            modal === "prefs"
              ? "Profil preferencji"
              : editId === null
                ? "Dodaj ogłoszenie"
                : "Edytuj ogłoszenie"
          }
        >
          {error && <p role="alert">{error}</p>}

          {modal === "prefs" ? (
            <form onSubmit={handleSavePreferences}>
              <p>Te ustawienia wpływają na ranking wszystkich mieszkań.</p>
              <label>
                Budżet maksymalny (zł)
                <input
                  type="number"
                  min="1"
                  max="9999999999"
                  required
                  value={pref.budget}
                  onChange={(e) => setPref({ ...pref, budget: e.target.value })}
                />
              </label>
              <label>
                Waga ceny: {pref.weight}%
                <input
                  type="range"
                  value={pref.weight}
                  onChange={(e) => setPref({ ...pref, weight: +e.target.value })}
                />
              </label>
              <p>Waga dojazdu: {100 - pref.weight}%</p>
              <Button variant="primary" disabled={busy}>
                Zastosuj preferencje
              </Button>
            </form>
          ) : (
            <OfferForm
              value={offer}
              onChange={setOffer}
              onSubmit={handleSaveOffer}
              busy={busy}
            />
          )}
        </Modal>
      )}
    </>
  );
}
