import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Armchair,
  Users,
  ClipboardList,
  Settings,
  LogOut,
} from "lucide-react";

const menus = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Meubles", path: "/meubles", icon: Armchair },
  { label: "Clients", path: "/clients", icon: Users },
  { label: "Locations", path: "/locations", icon: ClipboardList },
  { label: "Paramètres", path: "/settings", icon: Settings },
];

function Sidebar() {
  const navigate = useNavigate();

  function deconnexion() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-white p-5 flex flex-col">
      <h1 className="text-2xl font-bold mb-10">BureauMeuble</h1>

      <nav className="flex-1 space-y-2">
        {menus.map((menu) => {
          const Icon = menu.icon;

          return (
            <NavLink
              key={menu.path}
              to={menu.path}
              className={({ isActive }) =>
                `flex items-center gap-3 p-3 rounded-lg transition ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800"
                }`
              }
            >
              <Icon size={20} />
              {menu.label}
            </NavLink>
          );
        })}
      </nav>

      <button
        onClick={deconnexion}
        className="flex items-center gap-3 p-3 rounded-lg text-slate-300 hover:bg-slate-800"
      >
        <LogOut size={20} />
        Déconnexion
      </button>
    </aside>
  );
}

export default Sidebar;