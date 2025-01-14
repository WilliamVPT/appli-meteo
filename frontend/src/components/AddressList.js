import React, { useState, useEffect } from "react";
import apiClient from "../axiosConfig";
import WeatherForecast from "./WeatherForecast";
import 'bootstrap/dist/css/bootstrap.min.css';

const AddressList = () => {
  const [addresses, setAddresses] = useState([]);
  const [newAddress, setNewAddress] = useState("");
  const [message, setMessage] = useState("");
  const [selectedAddress, setSelectedAddress] = useState(null);

  // Fonction pour extraire le user_id du token
  const getUserIdFromToken = () => {
    const token = localStorage.getItem("authToken");
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1])); // Décoder le payload du JWT
      console.log("Payload:", payload);
      return payload.user_id; // Assurez-vous que le payload contient un champ user_id
    }
    return null;
  };

  useEffect(() => {
    const userId = getUserIdFromToken();
    console.log("User ID:", userId);
    if (userId) {
      const url = `api/adresses/user/${userId}`;
      console.log("API URL:", url); // Afficher l'URL de la requête dans la console
      apiClient
        .get(url)
        .then((response) => {
          console.log("API Response:", response); // Afficher la réponse de l'API dans la console
          if (Array.isArray(response.data)) {
            setAddresses(response.data);
          } else {
            setMessage("Données des adresses invalides.");
          }
        })
        .catch((error) => {
          console.error("API Error:", error); // Afficher l'erreur de l'API dans la console
          setMessage("Erreur de récupération des adresses.");
        });
    } else {
      setMessage("Utilisateur non authentifié.");
      // Rediriger vers la page de connexion
      window.location.href = "/login";
    }
  }, []);

  const handleAddAddress = () => {
    if (!newAddress.trim()) {
      setMessage("Veuillez entrer une adresse.");
      return;
    }

    // Rechercher l'adresse via l'API Adresse.data.gouv.fr
    apiClient
      .get(`https://api-adresse.data.gouv.fr/search/?q=${newAddress}&limit=1`)
      .then((response) => {
        if (response.data && response.data.features.length > 0) {
          const addressData = response.data.features[0];
          const location = addressData.properties.label;
          const coordinates = {
            latitude: addressData.geometry.coordinates[1],
            longitude: addressData.geometry.coordinates[0],
          };
          console.log("Adresse trouvée:", location);

          const userId = getUserIdFromToken(); // Récupérer user_id pour l'ajout
          console.log("User ID:", userId);
          if (userId) {
            // Ajouter l'adresse à votre propre API avec user_id
            apiClient
              .post(
                "api/adresses",
                { location, user_id: userId, coordinates }, // Inclure user_id et les coordonnées dans le corps de la requête
                {
                  headers: {
                    "Content-Type": "application/json", // Assurez-vous d'avoir ce Content-Type
                  },
                }
              )
              .then((response) => {
                setAddresses((prevAddresses) => [
                  ...prevAddresses,
                  response.data,
                ]);
                setNewAddress("");
                setMessage("Adresse ajoutée avec succès !");
                window.location.reload(); // Recharger la page pour afficher la nouvelle adresse
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
                    "Une erreur est survenue lors de l'ajout de l'adresse."
                );
              });
          }
        } else {
          setMessage("Aucune adresse trouvée. Veuillez vérifier l'entrée.");
        }
      })
      .catch((error) => {
        console.error(error);
        setMessage("Erreur lors de la recherche de l'adresse.");
      });
  };

  const handleDeleteAddress = (id) => {
    const userId = getUserIdFromToken(); // Récupérer user_id pour la suppression
    if (userId) {
      apiClient
        .delete(`api/addresses/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            "Content-Type": "application/json",
          },
          data: { user_id: userId }, // Inclure user_id dans le corps de la requête
        })
        .then(() => {
          setAddresses((prevAddresses) =>
            prevAddresses.filter((address) => address.id !== id)
          );
          setMessage("Adresse supprimée avec succès !");
        })
        .catch((error) => {
          console.error(error);
          setMessage("Erreur lors de la suppression de l'adresse.");
        });
    } else {
      setMessage("Utilisateur non authentifié.");
    }
  };

  const handleShowWeather = (address) => {
    setSelectedAddress(address);
  };

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">Liste des adresses</h2>
      {message && <div className="alert alert-info">{message}</div>}
      <div className="row">
        {addresses.map((address) => (
          <div key={address.id} className="col-md-6 mb-3">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">{address.location}</h5>
                <WeatherForecast location={address.location} />
                <button
                  className="btn btn-danger mt-2"
                  onClick={() => handleDeleteAddress(address.id)}
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="input-group mb-3">
        <input
          type="text"
          className="form-control"
          value={newAddress}
          onChange={(e) => setNewAddress(e.target.value)}
          placeholder="Entrez une nouvelle adresse"
        />
        <button className="btn btn-primary" onClick={handleAddAddress}>
          Ajouter l'adresse
        </button>
      </div>
    </div>
  );
};

export default AddressList;
