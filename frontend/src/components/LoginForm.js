import React, { useState } from "react";
import apiClient from "../axiosConfig";
import 'bootstrap/dist/css/bootstrap.min.css';

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    apiClient
      .post("/login", { email, password })
      .then((response) => {
        localStorage.setItem("authToken", response.data.token);
        localStorage.setItem("isConnected", "true");
        window.location.href = "/"; // Rediriger vers la page d'accueil
      })
      .catch((error) => {
        console.error("Error:", error); // Log de l'erreur
        if (error.response) {
          // Le serveur a répondu avec un statut autre que 2xx
          console.error("Response data:", error.response.data);
          console.error("Response status:", error.response.status);
          console.error("Response headers:", error.response.headers);
        } else if (error.request) {
          // La requête a été faite mais aucune réponse n'a été reçue
          console.error("Request:", error.request);
        } else {
          // Quelque chose s'est mal passé lors de la configuration de la requête
          console.error("Error message:", error.message);
        }
        setMessage(
          error.response?.data?.error ||
            "Une erreur est survenue lors de la connexion."
        );
      });
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow">
            <div className="card-body">
              <h3 className="text-center mb-4">Connexion</h3>
              {message && <div className="alert alert-danger">{message}</div>}
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Mot de passe</label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary w-100">Se connecter</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
