import React from "react";
/**
 * Reusable button with variants: "primary" | "outline" | "circle" | "link" | "filter"
 *
 * @param {{ variant?: string } & React.ButtonHTMLAttributes<HTMLButtonElement>} props
 */

export function Button({
  variant = "primary",
  className = "",
  children,
  ...rest
}) {
  return (
    <button
      className={[variant, className].filter(Boolean).join(" ")}
      {...rest}
    >
      {children}
    </button>
  );
}
