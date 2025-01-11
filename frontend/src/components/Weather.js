import React, { useEffect, useState } from "react";
import axios from "axios";
import AuthButtons from "./AuthButtons";
import AddressList from "./AddressList";

// Fonction de mappage pour les descriptions des codes météo
const getWeatherDescription = (weatherCode) => {
  const descriptions = {
    0: "Ciel clair",
    1: "Principalement clair",
    2: "Partiellement nuageux",
    3: "Nuageux",
    45: "Brouillard",
    48: "Brouillard givrant",
    51: "Bruine légère",
    53: "Bruine modérée",
    55: "Bruine dense",
    56: "Bruine légère verglaçante",
    57: "Bruine dense verglaçante",
    61: "Pluie légère",
    63: "Pluie modérée",
    65: "Pluie forte",
    66: "Pluie légère verglaçante",
    67: "Pluie forte verglaçante",
    71: "Chutes de neige légères",
    73: "Chutes de neige modérées",
    75: "Chutes de neige fortes",
    77: "Grains de neige",
    80: "Averses de pluie légères",
    81: "Averses de pluie modérées",
    82: "Averses de pluie violentes",
    85: "Averses de neige légères",
    86: "Averses de neige fortes",
    95: "Orage",
    96: "Orage avec grêle légère",
    99: "Orage avec grêle forte",
  };
  return descriptions[weatherCode] || "Code météo inconnu";
};

const Weather = () => {
  const [weather, setWeather] = useState(null);
  const [isConnected, setIsConnected] = useState(false); // État de connexion

  useEffect(() => {
    const savedConnectionState = localStorage.getItem("isConnected") === "true";
    setIsConnected(savedConnectionState);
    axios
      .get("http://localhost:8000/api/weather")
      .then((response) => setWeather(response.data))
      .catch((error) => console.error(error));
  }, []);

  return (
    <div className="container mt-5">
      <div className="card shadow">
        <div className="card-body">
          <h1 className="text-center mb-4">Météo à Reims</h1>

          {weather ? (
            <div className="text-center">
              <p className="display-6">
                Température : {weather.current_weather.temperature}°C
              </p>
              <p className="lead">
                Description :{" "}
                {getWeatherDescription(weather.current_weather.weathercode)}
              </p>
            </div>
          ) : (
            <p className="text-center">Chargement...</p>
          )}

          <AuthButtons />

          {isConnected ? <AddressList /> : null}
        </div>
      </div>
    </div>
  );
};

export default Weather;
