import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const RegisterForm = () => {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Email:", email, "Password:", password); // Vérifie les valeurs des champs

    axios
      .post(
        "http://localhost:8000/api/register",
        { email, password },
        {
          headers: {
            "Content-Type": "application/json", // assure-toi d'envoyer des données JSON
          },
        }
      )
      .then((response) => {
        console.log("Response:", response); // Log de la réponse
        setMessage("Inscription réussie !");
        // Redirection après une réponse réussie
        setTimeout(() => {
          nav("/");
        }, 2000); // Redirige après 2 secondes pour afficher le message
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
            "Une erreur est survenue lors de l'inscription."
        );
      });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Inscription</h2>
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
      <button type="submit">S'inscrire</button>
      {message && <p>{message}</p>}
    </form>
  );
};

export default RegisterForm;
