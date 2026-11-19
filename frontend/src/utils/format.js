export const cash = (n) => n.toLocaleString("pl-PL") + " zł";
export const points = (n) =>
  n.toLocaleString("pl-PL", { maximumFractionDigits: 3 });
export const fold = (s) =>
  String(s || "")
    .toLocaleLowerCase("pl")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replaceAll("ł", "l");

export async function api(path, method = "GET", data) {
  const r = await fetch("/api/" + path, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
  });
  if (!r.ok) {
    const err = await r.json().catch(() => ({}));
    throw Error(
      typeof err.detail === "string"
        ? err.detail
        : r.status === 422
          ? "Sprawdź wartości w formularzu."
          : "Nie udało się połączyć z API.",
    );
  }
  return r.json();
}
