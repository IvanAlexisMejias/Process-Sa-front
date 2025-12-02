import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import { apiFetch } from "@/services/api";
import logo from "@/assets/logo.svg";

interface PublicOptions {
  roles: { id: string; name: string }[];
  units: { id: string; name: string }[];
}

type AuthMode = "login" | "register";

const defaultOptions: PublicOptions = { roles: [], units: [] };

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, loading, initError } = useAppContext();
  const [mode, setMode] = useState<AuthMode>("login");
  const [options, setOptions] = useState<PublicOptions>(defaultOptions);
  const [error, setError] = useState<string>("");

  const [loginForm, setLoginForm] = useState({
    email: "gabriela@processsa.com",
    password: "Process123*",
  });

  const [registerForm, setRegisterForm] = useState({
    fullName: "",
    email: "",
    password: "",
    roleId: "",
    unitId: "",
  });

  useEffect(() => {
    apiFetch<PublicOptions>("/public/options")
      .then((data) => {
        setOptions(data);
        setRegisterForm((prev) => ({
          ...prev,
          roleId: data.roles[0]?.id ?? prev.roleId,
          unitId: data.units[0]?.id ?? prev.unitId,
        }));
      })
      .catch(() => {
        /* silencio */
      });
  }, []);

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    try {
      setError("");
      await login(loginForm);
      navigate("/app/overview");
    } catch (err) {
      setError((err as Error).message ?? "No fue posible iniciar sesión");
    }
  };

  const handleRegister = async (event: FormEvent) => {
    event.preventDefault();
    try {
      setError("");
      await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify(registerForm),
      });
      await login({ email: registerForm.email, password: registerForm.password });
      navigate("/app/overview");
    } catch (err) {
      setError((err as Error).message ?? "No fue posible registrar la cuenta");
    }
  };

  const isLogin = mode === "login";

  return (
    <div style={{ minHeight: "100vh", position: "relative", background: "#0c1e42", overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 15% 20%, rgba(27,99,216,0.35), transparent 32%), radial-gradient(circle at 85% 10%, rgba(67,198,172,0.25), transparent 28%), linear-gradient(140deg, #0c1e42 0%, #0f3f8c 50%, #0b1e3d 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(600px at 80% 60%, rgba(255,255,255,0.06), transparent 50%), radial-gradient(400px at 10% 80%, rgba(255,255,255,0.04), transparent 50%)",
        }}
      />
      <div
        className="card"
        style={{
          position: "relative",
          width: "min(1100px, 92%)",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1.1fr 0.9fr",
          gap: "2rem",
          alignItems: "stretch",
          padding: 0,
          overflow: "hidden",
          marginTop: "5vh",
          marginBottom: "5vh",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(10px)",
          boxShadow: "0 25px 70px rgba(0,0,0,0.35)",
        }}
      >
        <div
          style={{
            background: "linear-gradient(170deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))",
            color: "#fff",
            padding: "2.75rem",
            display: "flex",
            flexDirection: "column",
            gap: "1.75rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.9rem" }}>
            <img src={logo} alt="Process SA" style={{ width: "64px", height: "64px" }} />
            <div>
              <p style={{ margin: 0, textTransform: "uppercase", letterSpacing: 2, fontSize: "0.8rem", color: "rgba(255,255,255,0.7)" }}>
                Process SA
              </p>
              <h1 style={{ margin: "0.2rem 0 0" }}>Plataforma de procesos</h1>
            </div>
          </div>
          <p style={{ margin: 0, color: "rgba(255,255,255,0.85)", fontSize: "1rem", lineHeight: 1.5 }}>
            Autentícate con tus credenciales corporativas o crea una cuenta indicando tu perfil. NestJS + Prisma +
            PostgreSQL mantienen tu operación sincronizada.
          </p>
          <div
            style={{
              borderRadius: "1rem",
              padding: "1rem",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <p style={{ margin: "0 0 0.5rem", color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>Usuarios demo</p>
            <ul style={{ color: "rgba(255,255,255,0.85)", paddingLeft: "1.25rem", margin: 0, lineHeight: 1.6 }}>
              <li>gabriela@processsa.com · Administradora</li>
              <li>joaquin@processsa.com · Diseñador</li>
              <li>maria@processsa.com · Funcionario</li>
            </ul>
          </div>
          <div
            style={{
              height: "220px",
              borderRadius: "1.25rem",
              background:
                "radial-gradient(circle at 25% 30%, rgba(67,198,172,0.25), transparent 42%), radial-gradient(circle at 75% 20%, rgba(27,99,216,0.35), transparent 40%), linear-gradient(145deg, rgba(255,255,255,0.1), rgba(255,255,255,0.04))",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          />
        </div>

        <div style={{ padding: "2.75rem", display: "flex", flexDirection: "column", gap: "1.5rem", background: "var(--bg-card)" }}>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button
              type="button"
              className="btn"
              style={{
                flex: 1,
                background: isLogin ? "var(--brand-soft)" : "transparent",
                border: isLogin ? "1px solid var(--brand)" : "1px solid var(--border-soft)",
                color: isLogin ? "var(--brand)" : "var(--text-strong)",
              }}
              onClick={() => setMode("login")}
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              className="btn"
              style={{
                flex: 1,
                background: !isLogin ? "var(--brand-soft)" : "transparent",
                border: !isLogin ? "1px solid var(--brand)" : "1px solid var(--border-soft)",
                color: !isLogin ? "var(--brand)" : "var(--text-strong)",
              }}
              onClick={() => setMode("register")}
            >
              Regístrate ahora
            </button>
          </div>

          {initError && (
            <div style={{ color: "var(--danger)", background: "var(--bg-muted)", padding: "0.75rem", borderRadius: "0.75rem" }}>
              {initError}
            </div>
          )}

          {isLogin ? (
            <form className="grid" style={{ gap: "1rem" }} onSubmit={handleLogin}>
              <label className="field">
                <span className="field-label">Correo corporativo</span>
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={loginForm.email}
                  onChange={(event) => setLoginForm((prev) => ({ ...prev, email: event.target.value }))}
                  required
                />
                <span className="field-hint">Usa el formato nombre@processsa.com</span>
              </label>
              <label className="field">
                <span className="field-label">Contraseña</span>
                <input
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  value={loginForm.password}
                  onChange={(event) => setLoginForm((prev) => ({ ...prev, password: event.target.value }))}
                  required
                />
                <span className="field-hint">Por defecto Process123* para usuarios semilla.</span>
              </label>
              {error && <span style={{ color: "var(--danger)" }}>{error}</span>}
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Ingresando..." : "Entrar al panel"}
              </button>
            </form>
          ) : (
            <form className="grid" style={{ gap: "1rem" }} onSubmit={handleRegister}>
              <label className="field">
                <span className="field-label">Nombre completo</span>
                <input
                  value={registerForm.fullName}
                  onChange={(event) =>
                    setRegisterForm((prev) => ({ ...prev, fullName: event.target.value }))
                  }
                  required
                />
                <span className="field-hint">Se usará para asignaciones y reportes.</span>
              </label>
              <label className="field">
                <span className="field-label">Correo</span>
                <input
                  type="email"
                  value={registerForm.email}
                  onChange={(event) =>
                    setRegisterForm((prev) => ({ ...prev, email: event.target.value }))
                  }
                  required
                />
              </label>
              <label className="field">
                <span className="field-label">Contraseña</span>
                <input
                  type="password"
                  value={registerForm.password}
                  onChange={(event) =>
                    setRegisterForm((prev) => ({ ...prev, password: event.target.value }))
                  }
                  required
                />
                <span className="field-hint">Debe tener al menos 6 caracteres.</span>
              </label>
              <label className="field">
                <span className="field-label">Perfil</span>
                <select
                  value={registerForm.roleId}
                  onChange={(event) =>
                    setRegisterForm((prev) => ({ ...prev, roleId: event.target.value }))
                  }
                >
                  {options.roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
                <span className="field-hint">Define los permisos iniciales.</span>
              </label>
              <label className="field">
                <span className="field-label">Unidad de trabajo</span>
                <select
                  value={registerForm.unitId}
                  onChange={(event) =>
                    setRegisterForm((prev) => ({ ...prev, unitId: event.target.value }))
                  }
                >
                  <option value="">Sin unidad</option>
                  {options.units.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.name}
                    </option>
                  ))}
                </select>
              </label>
              {error && <span style={{ color: "var(--danger)" }}>{error}</span>}
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Registrando..." : "Crear cuenta y continuar"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
