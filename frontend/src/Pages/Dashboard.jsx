
import { Armchair, Users, ClipboardList, Wallet } from "lucide-react";

const Dashboard = () => {
  const statistiques = [
    { titre: "Meubles", valeur: "24", icon: Armchair, couleur: "text-blue-600" },
    { titre: "Clients", valeur: "18", icon: Users, couleur: "text-green-600" },
    { titre: "Locations", valeur: "12", icon: ClipboardList, couleur: "text-purple-600" },
    { titre: "Revenus", valeur: "250 000 FCFA", icon: Wallet, couleur: "text-orange-600" },
  ];

  return (
    <main className="flex-1 p-8 bg-slate-50 min-h-screen">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">
          Tableau de bord
        </h2>
        <p className="text-slate-500 mt-2">
          Bienvenue sur votre espace de gestion.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {statistiques.map((stat) => {
          const Icon = stat.icon;

          return (
            <div key={stat.titre} className="card bg-white shadow-sm border border-slate-100">
              <div className="card-body">
                <Icon className={stat.couleur} size={30} />
                <p className="text-slate-500">{stat.titre}</p>
                <h3 className="text-2xl font-bold text-slate-800">
                  {stat.valeur}
                </h3>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card bg-white shadow-sm border border-slate-100 mt-8">
        <div className="card-body">
          <h3 className="card-title text-slate-800">
            Activité récente
          </h3>
          <p className="text-slate-500">
            Les dernières locations apparaîtront ici.
          </p>
        </div>
      </div>
    </main>
  );
};

export default Dashboard;
