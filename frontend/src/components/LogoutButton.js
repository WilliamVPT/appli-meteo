import React from "react";

const LogoutButton = () => {
  const handleLogout = () => {
    // Supprime le token et l'état de connexion
    localStorage.removeItem("authToken");
    localStorage.setItem("isConnected", "false");

    // Rafraîchit la page
    window.location.reload();
  };

  return (
    <button onClick={handleLogout} className="btn btn-danger">
      Déconnexion
    </button>
  );
};

export default LogoutButton;
