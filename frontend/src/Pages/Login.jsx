import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErreur("");
    setChargement(true);

    try {
      const response = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, motDePasse }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Identifiants incorrects.");
      }

      localStorage.setItem("token", data.token);
      navigate("/dashboard");
    } catch (error) {
      setErreur(error.message);
    } finally {
      setChargement(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <h1 className="text-3xl font-bold text-center text-primary">
            BureauMeuble
          </h1>

          <p className="text-center text-base-content/60 mb-4">
            Espace administrateur
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="form-control w-full">
              <span className="label-text mb-2">Adresse e-mail</span>
              <input
                type="email"
                className="input input-bordered w-full"
                placeholder="admin@bureaumeuble.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>

            <label className="form-control w-full">
              <span className="label-text mb-2">Mot de passe</span>
              <input
                type="password"
                className="input input-bordered w-full"
                placeholder="Votre mot de passe"
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                required
              />
            </label>

            {erreur && (
              <p className="text-error text-sm">{erreur}</p>
            )}

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={chargement}
            >
              {chargement ? "Connexion..." : "Se connecter"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;