import { useState } from "react";

/**
 * Provides shared async-operation state: busy, error, and a run() wrapper.
 * Also exposes a load() helper that wraps a provided fetch function.
 *
 * @param {() => Promise<any>} fetchFn - function called by load()
 */
export function useApi(fetchFn) {
  const [data, setData] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

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
      const result = await fetchFn();
      setData(result);
      return result;
    });
  }

  return { data, setData, busy, error, setError, run, load };
}
