import type { ReactNode } from "react";

type CardProps = {
  title?: string;
  subtitle?: string;
  headerRight?: ReactNode;
  children: ReactNode;
};

export default function Card({ title, subtitle, headerRight, children }: CardProps) {
  return (
    <div className="card">
      {(title || subtitle || headerRight) && (
        <div className="card-header">
          <div className="card-header-row">
            <div>
              {title && <div className="h2">{title}</div>}
              {subtitle && <div className="muted">{subtitle}</div>}
            </div>
            {headerRight}
          </div>
        </div>
      )}
      <div className="card-body">{children}</div>
    </div>
  );
}
