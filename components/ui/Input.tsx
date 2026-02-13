import type { InputHTMLAttributes, Ref } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  helpText?: string;
  error?: string;
  inputRef?: Ref<HTMLInputElement>;
};

export default function Input({
  label,
  helpText,
  error,
  className,
  id,
  inputRef,
  ...rest
}: InputProps) {
  const inputId = id ?? rest.name ?? undefined;
  return (
    <label className="input-field" htmlFor={inputId}>
      {label && <div className="label">{label}</div>}
      <input
        id={inputId}
        ref={inputRef}
        className={`input ${error ? "input-error" : ""} ${className ?? ""}`.trim()}
        {...rest}
      />
      {helpText && !error && <div className="help">{helpText}</div>}
      {error && <div className="error">{error}</div>}
    </label>
  );
}
