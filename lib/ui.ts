import type { CSSProperties } from "react";

export const containerStyle: CSSProperties = {
  fontFamily:
    "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
  background: "#f7f7f8",
  minHeight: "100vh",
  padding: 24,
};

export const cardStyle: CSSProperties = {
  background: "#fff",
  borderRadius: 14,
  boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
  border: "1px solid rgba(0,0,0,0.08)",
  padding: 16,
};

export const h1Style: CSSProperties = {
  fontSize: 26,
  fontWeight: 700,
  margin: "0 0 8px",
};

export const h2Style: CSSProperties = {
  fontSize: 18,
  fontWeight: 600,
  margin: "0 0 8px",
};

export const labelStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: 0.3,
  textTransform: "uppercase",
  color: "#6b7280",
  marginBottom: 6,
};

export const inputStyle: CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  fontSize: 15,
  borderRadius: 10,
  border: "1px solid rgba(0,0,0,0.12)",
  outline: "none",
};

export const numberInputStyle: CSSProperties = {
  ...inputStyle,
};

export const primaryButtonStyle: CSSProperties = {
  padding: "10px 16px",
  fontWeight: 600,
  borderRadius: 10,
  border: "1px solid #111",
  background: "#111",
  color: "#fff",
  cursor: "pointer",
};

export const secondaryButtonStyle: CSSProperties = {
  padding: "10px 14px",
  fontWeight: 600,
  borderRadius: 10,
  border: "1px solid rgba(0,0,0,0.2)",
  background: "#fff",
  color: "#111",
  cursor: "pointer",
};

export const dangerButtonStyle: CSSProperties = {
  padding: "10px 14px",
  fontWeight: 600,
  borderRadius: 10,
  border: "1px solid #c53030",
  background: "#c53030",
  color: "#fff",
  cursor: "pointer",
};

export const pillRowStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
};

export const pillStyle = (isActive: boolean): CSSProperties => ({
  padding: "6px 12px",
  borderRadius: 999,
  border: isActive ? "1px solid #111" : "1px solid #cbd5e1",
  background: isActive ? "#111" : "#fff",
  color: isActive ? "#fff" : "#111",
  cursor: "pointer",
  fontWeight: 600,
});

export const smallMutedTextStyle: CSSProperties = {
  fontSize: 12,
  color: "#6b7280",
};
