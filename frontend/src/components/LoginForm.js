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

      // Stocke le jeton dans localStorage
      const token = response.data.token; // Assurez-vous que votre API renvoie un jeton
      localStorage.setItem("authToken", token);

      // Indique que l'utilisateur est connecté
      localStorage.setItem("isConnected", "true");

      setMessage("Connexion réussie !");
      nav("/"); // Redirige vers la page d'accueil
    } catch (error) {
      // Affiche un message d'erreur approprié
      setMessage(
        error.response?.data?.error || "Une erreur est survenue lors de la connexion."
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
