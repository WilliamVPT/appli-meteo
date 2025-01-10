import React from "react";
import { useNavigate } from "react-router-dom";

const AuthButtons = () => {
  const navigate = useNavigate(); // Appel à useNavigate à l'intérieur de la fonction composant

  const handleRegisterClick = () => {
    navigate("/register");
  };

  const handleLoginClick = () => {
    navigate("/login");
  };

  return (
    <div className="text-center mt-4">
      <button className="btn btn-primary mx-2" onClick={handleRegisterClick}>
        S'inscrire
      </button>
      <button className="btn btn-secondary mx-2" onClick={handleLoginClick}>
        Se connecter
      </button>
    </div>
  );
};

export default AuthButtons;
