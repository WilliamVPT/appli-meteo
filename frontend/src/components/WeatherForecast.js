import React, { useState, useEffect } from "react";
import apiClient from "../axiosConfig";

const WeatherForecast = ({ location }) => {
  const [forecast, setForecast] = useState([]);
  const [error, setError] = useState("");
  const [coordinates, setCoordinates] = useState({ latitude: null, longitude: null });

  // Fonction pour récupérer les coordonnées géographiques de l'adresse
  const getCoordinates = (address) => {
    apiClient
      .get(`https://api-adresse.data.gouv.fr/search/?q=${address}&limit=1`)
      .then((response) => {
        if (response.data.features.length > 0) {
          const { lat, lon } = response.data.features[0].geometry.coordinates;
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
          `https://api.open-meteo.com/v1/forecast?latitude=${coordinates.latitude}&longitude=${coordinates.longitude}&daily=temperature_2m_max,temperature_2m_min&timezone=Europe/Paris`
        )
        .then((response) => setForecast(response.data.daily))
        .catch((error) => setError("Impossible de récupérer la météo."));
    }
  }, [coordinates]);

  return (
    <div>
      <h3>Météo pour : {location}</h3>
      {error ? (
        <p>{error}</p>
      ) : (
        <ul>
          {forecast.map((day, index) => (
            <li key={index}>
              {day.date}: Max {day.temperature_2m_max}°C, Min {day.temperature_2m_min}°C
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default WeatherForecast;
