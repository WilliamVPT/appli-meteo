import React, { useState, useEffect } from "react";
import apiClient from "../axiosConfig";
import 'bootstrap/dist/css/bootstrap.min.css';

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

const WeatherForecast = ({ location }) => {
  const [forecast, setForecast] = useState([]);
  const [error, setError] = useState("");
  const [coordinates, setCoordinates] = useState({ latitude: null, longitude: null });

  // Fonction pour récupérer les coordonnées géographiques de l'adresse
  const getCoordinates = (address) => {
    apiClient
      .get(`https://api-adresse.data.gouv.fr/search/?q=${address}&limit=1`)
      .then((response) => {
        console.log("API Response:", response.data);
        if (response.data.features.length > 0) {
          const [lon, lat] = response.data.features[0].geometry.coordinates;
          console.log("lat", lat, "lon", lon);
          setCoordinates({ latitude: lat, longitude: lon });
        } else {
          setError("Adresse introuvable.");
        }
      })
      .catch((error) => setError("Erreur lors de la récupération des coordonnées."));
  };

  useEffect(() => {
    if (location) {
      // Appeler l'API pour récupérer les coordonnées lorsque l'adresse change
      getCoordinates(location);
    }
  }, [location]);

  useEffect(() => {
    if (coordinates.latitude && coordinates.longitude) {
      // Si les coordonnées sont disponibles, récupérer la météo
      apiClient
        .get(
          `https://api.open-meteo.com/v1/forecast?latitude=${coordinates.latitude}&longitude=${coordinates.longitude}&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=Europe/Paris`
        )
        .then((response) => {
          console.log("Weather API Response:", response.data);
          if (response.data && response.data.daily) {
            const dailyData = response.data.daily;
            const transformedForecast = dailyData.time.map((date, index) => ({
              date,
              temperature_2m_max: dailyData.temperature_2m_max[index],
              temperature_2m_min: dailyData.temperature_2m_min[index],
              description: getWeatherDescription(dailyData.weathercode[index]),
            }));
            setForecast(transformedForecast);
          } else {
            setError("Données météo indisponibles.");
          }
        })
        .catch((error) => setError("Impossible de récupérer la météo."));
    }
  }, [coordinates]);

  return (
    <div className="container mt-4">
      <h3 className="text-center mb-4">Météo pour : {location}</h3>
      {error ? (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      ) : (
        <div className="row">
          {Array.isArray(forecast) && forecast.length > 0 ? (
            forecast.map((day, index) => (
              <div key={index} className="col-md-4 mb-3">
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title">{day.date}</h5>
                    <p className="card-text">
                      <strong>Max:</strong> {day.temperature_2m_max}°C<br />
                      <strong>Min:</strong> {day.temperature_2m_min}°C<br />
                      <strong>Description:</strong> {day.description}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center">Aucune donnée météo disponible.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default WeatherForecast;
