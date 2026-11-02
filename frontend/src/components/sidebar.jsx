
import {
  LayoutDashboard,
  Armchair,
  Users,
  ClipboardList,
  Settings
} from "lucide-react";

const Sidebar = () => {
  const menu = [
    { name: "Tableau de bord", icon: LayoutDashboard },
    { name: "Meubles", icon: Armchair },
    { name: "Clients", icon: Users },
    { name: "Locations", icon: ClipboardList },
    { name: "Paramètres", icon: Settings },
  ];

  return (
    <aside className="w-64 min-h-screen bg-[#172554] text-white p-5">
      <h1 className="text-2xl font-bold mb-2">
        BureauMeuble
      </h1>
      <p className="text-blue-200 text-xs mb-10">
        GESTION DE LOCATION
      </p>

      <ul className="menu gap-2 p-0">
        {menu.map((item) => {
          const Icon = item.icon;

          return (
            <li key={item.name}>
              <a className="text-white hover:bg-blue-800">
                <Icon size={20} />
                {item.name}
              </a>
            </li>
          );
        })}
      </ul>
    </aside>
  );
};

export default Sidebar;
