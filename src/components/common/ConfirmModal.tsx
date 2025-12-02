import type { ReactNode } from "react";

interface ConfirmModalProps {
  open: boolean;
  title?: string;
  message?: string | ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal = ({
  open,
  title = "Confirmar",
  message = "¿Estás seguro?",
  confirmLabel = "Sí",
  cancelLabel = "Cancelar",
  onConfirm,
  onCancel,
}: ConfirmModalProps) => {
  if (!open) return null;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(12,30,66,0.45)",
        display: "grid",
        placeItems: "center",
        zIndex: 2000,
        padding: "1rem",
      }}
    >
      <div
        style={{
          background: "var(--bg-card)",
          borderRadius: "14px",
          padding: "1.25rem 1.5rem",
          maxWidth: "420px",
          width: "100%",
          boxShadow: "0 18px 50px rgba(0,0,0,0.25)",
        }}
      >
        <h3 style={{ margin: "0 0 0.35rem" }}>{title}</h3>
        {typeof message === "string" ? <p style={{ margin: "0 0 1rem", color: "var(--text-muted)" }}>{message}</p> : message}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
          <button className="btn btn-outline" type="button" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button className="btn btn-primary" type="button" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
