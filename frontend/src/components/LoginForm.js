import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const LoginForm = () => {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:8000/api/login", {
        email,
        password,
      });

      // Vérifiez si la réponse contient un token
      const token = response.data.token;
      if (token) {
        // Stocke le jeton dans localStorage
        localStorage.setItem("authToken", token);

        // Indique que l'utilisateur est connecté
        localStorage.setItem("isConnected", "true");

        setMessage("Connexion réussie !");
        setTimeout(() => {
          nav("/"); // Redirige vers la page d'accueil ou une autre page
        }, 1000); // Temporisation avant la redirection
      } else {
        setMessage("Jeton de connexion manquant.");
      }
    } catch (error) {
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
      }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Connexion</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Mot de passe"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit">Se connecter</button>
      {message && <p>{message}</p>}
    </form>
  );
};

export default LoginForm;
