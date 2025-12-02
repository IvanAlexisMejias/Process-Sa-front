import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType, durationMs?: number) => void;
  toasts: Toast[];
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "info", durationMs = 3200) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, type }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, durationMs);
  }, []);

  const value = useMemo(() => ({ showToast, toasts }), [showToast, toasts]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        style={{
          position: "fixed",
          right: "1.5rem",
          bottom: "1.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.6rem",
          zIndex: 9999,
          pointerEvents: "none",
        }}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            style={{
              minWidth: "240px",
              padding: "0.75rem 1rem",
              borderRadius: "0.9rem",
              color: toast.type === "error" ? "#5f1111" : toast.type === "success" ? "#0b3d22" : "#0c1e42",
              background:
                toast.type === "error"
                  ? "linear-gradient(120deg, #ffe0e0, #ffd1d1)"
                  : toast.type === "success"
                    ? "linear-gradient(120deg, #d1f4e3, #c3ecd8)"
                    : "linear-gradient(120deg, #eef3ff, #e3e9ff)",
              border: "1px solid rgba(12,30,66,0.08)",
              boxShadow: "0 12px 28px rgba(0,0,0,0.12)",
              pointerEvents: "auto",
            }}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
};
