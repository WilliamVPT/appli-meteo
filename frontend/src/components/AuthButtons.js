import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LogoutButton from "./LogoutButton";

const AuthButtons = () => {
  const navigate = useNavigate(); // Pour naviguer entre les pages
  const [isConnected, setIsConnected] = useState(false); // État de connexion

  // Vérifie si l'utilisateur est connecté (lecture de localStorage)
  useEffect(() => {
    const savedConnectionState = localStorage.getItem("isConnected") === "true";
    setIsConnected(savedConnectionState);
  }, []);

  // Gestion de la déconnexion (optionnel)
  const handleLogout = () => {
    setIsConnected(false);
    localStorage.removeItem("isConnected"); // Supprime l'état de connexion
  };

  // Simule la connexion (par exemple après un login réussi)
  const handleLoginSuccess = () => {
    setIsConnected(true);
    localStorage.setItem("isConnected", "true"); // Sauvegarde l'état
  };

  // Boutons rendus conditionnellement
  return (
    <div className="text-center mt-4">
      {!isConnected ? (
        <>
          <button className="btn btn-primary mx-2" onClick={() => navigate("/register")}>
            S'inscrire
          </button>
          <button className="btn btn-secondary mx-2" onClick={() => navigate("/login")}>
            Se connecter
          </button>
        </>
      ) : (
        <LogoutButton />
      )}
    </div>
  );
};

export default AuthButtons;
