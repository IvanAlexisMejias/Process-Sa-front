import { Link } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import { RoleBadge } from "@/components/common/RoleBadge";
import { UserAvatar } from "@/components/common/UserAvatar";
import { useTheme } from "@/context/ThemeContext";

export const TopBar = () => {
  const { currentUser, roles, logout } = useAppContext();
  const { theme, toggleTheme } = useTheme();
  const role = roles.find((item) => item.id === currentUser?.roleId);

  if (!currentUser || !role) return null;

  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "1.5rem 2rem",
        borderBottom: "1px solid var(--border-soft)",
        background: "var(--bg-card)",
        position: "sticky",
        top: 0,
        zIndex: 2,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
        <UserAvatar name={currentUser.fullName} color={currentUser.avatarColor} />
        <div>
          <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.85rem" }}>Bienvenido</p>
          <h2 style={{ margin: 0 }}>{currentUser.fullName}</h2>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <RoleBadge role={role} />
        <Link className="btn btn-outline" to="/app/profile">
          Mi perfil
        </Link>
        <button className="btn btn-outline" type="button" onClick={toggleTheme}>
          {theme === "light" ? "🌙 Modo oscuro" : "☀️ Modo claro"}
        </button>
        <button className="btn btn-primary" type="button" onClick={logout}>
          Cerrar sesión
        </button>
      </div>
    </header>
  );
};
