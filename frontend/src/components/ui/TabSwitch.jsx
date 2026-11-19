import React from "react";
/**
 * Reusable pill/tab switch. Renders a group of toggle buttons.
 *
 * @param {{ tabs: Array<[value: string, label: string]>, active: string, onChange: (v: string) => void }} props
 */
export function TabSwitch({ tabs, active, onChange }) {
  return (
    <div className="switch">
      {tabs.map(([value, label]) => (
        <button
          key={value}
          aria-pressed={active === value}
          onClick={() => onChange(value)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
