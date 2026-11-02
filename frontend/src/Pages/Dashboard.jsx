
import { useEffect, useState } from "react";
import {
  Armchair,
  Users,
  ClipboardList,
  Wallet
} from "lucide-react";

const Dashboard = () => {
  const [meubles, setMeubles] = useState([]);
  const [clients, setClients] = useState([]);
  const [locations, setLocations] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    const chargerDonnees = async () => {
      try {
        const [resMeubles, resClients, resLocations] =
          await Promise.all([
            fetch("http://localhost:3000/meubles"),
            fetch("http://localhost:3000/clients"),
            fetch("http://localhost:3000/locations")
          ]);

        if (!resMeubles.ok || !resClients.ok || !resLocations.ok) {
          throw new Error("Impossible de récupérer les données.");
        }

        const [dataMeubles, dataClients, dataLocations] =
          await Promise.all([
            resMeubles.json(),
            resClients.json(),
            resLocations.json()
          ]);

        setMeubles(dataMeubles);
        setClients(dataClients);
        setLocations(dataLocations);

      } catch (error) {
        setErreur(error.message);
      } finally {
        setChargement(false);
      }
    };

    chargerDonnees();
  }, []);

  const revenus = locations.reduce(
    (total, location) => total + Number(location.montantTotal || 0),
    0
  );

  const statistiques = [
    {
      titre: "Meubles actifs",
      valeur: meubles.length,
      icon: Armchair,
      couleur: "text-blue-600"
    },
    {
      titre: "Clients actifs",
      valeur: clients.length,
      icon: Users,
      couleur: "text-green-600"
    },
    {
      titre: "Locations",
      valeur: locations.length,
      icon: ClipboardList,
      couleur: "text-purple-600"
    },
    {
      titre: "Montant des locations",
      valeur: `${revenus.toLocaleString("fr-FR")} FCFA`,
      icon: Wallet,
      couleur: "text-orange-600"
    }
  ];

  if (chargement) {
    return (
      <main className="flex-1 p-8 bg-slate-50">
        <span className="loading loading-spinner loading-lg"></span>
        <p>Chargement du tableau de bord...</p>
      </main>
    );
  }

  if (erreur) {
    return (
      <main className="flex-1 p-8 bg-slate-50">
        <div className="alert alert-error">{erreur}</div>
      </main>
    );
  }

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
            <div
              key={stat.titre}
              className="card bg-white shadow-sm border border-slate-100"
            >
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

          {locations.length === 0 ? (
            <p className="text-slate-500">
              Aucune location enregistrée pour le moment.
            </p>
          ) : (
            <p className="text-slate-500">
              {locations.length} location(s) enregistrée(s).
            </p>
          )}
        </div>
      </div>
    </main>
  );
};

export default Dashboard;

