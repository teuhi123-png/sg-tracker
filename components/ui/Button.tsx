import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "secondary" | "destructive";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  loading?: boolean;
};

export default function Button({
  variant = "primary",
  loading = false,
  disabled,
  className,
  children,
  ...rest
}: ButtonProps) {
  const variantClass =
    variant === "primary"
      ? "btn-primary"
      : variant === "destructive"
        ? "btn-danger"
        : "btn-secondary";

  return (
    <button
      className={`btn ${variantClass} ${className ?? ""}`.trim()}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? "Loading..." : children}
    </button>
  );
}
