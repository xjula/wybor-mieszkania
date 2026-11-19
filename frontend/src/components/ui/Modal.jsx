import React from "react";
import { useEffect, useRef } from "react";
import { X } from "lucide-react";

/**
 * Reusable modal dialog built on the native <dialog> element.
 * Closes on backdrop click, Escape key, or when `close` is called.
 *
 * @param {{ title: string, close: () => void, children: React.ReactNode }} props
 */
export function Modal({ title, close, children }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    el.showModal();
    return () => el.close();
  }, []);

  return (
    <dialog
      ref={ref}
      aria-labelledby="modal-title"
      onCancel={close}
      onClick={(e) => {
        if (e.target === ref.current) close();
      }}
    >
      <div className="dialoginner">
        <div className="dialoghead">
          <h2 id="modal-title">{title}</h2>
          <button className="circle" aria-label="Zamknij" onClick={close}>
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
