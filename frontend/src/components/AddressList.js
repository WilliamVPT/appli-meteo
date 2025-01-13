import React, { useState, useEffect } from "react";
import apiClient from "../axiosConfig";

const AddressList = () => {
  const [addresses, setAddresses] = useState([]);
  const [newAddress, setNewAddress] = useState("");
  const [message, setMessage] = useState("");

  // Fonction pour extraire le user_id du token
  const getUserIdFromToken = () => {
    const token = localStorage.getItem("authToken");
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1])); // Décoder le payload du JWT
      console.log("Payload:", payload);
      return payload.user_id; // Assurez-vous que le payload contient un champ user_id
    }
    return null;
  };

  useEffect(() => {
    const userId = getUserIdFromToken();
    console.log("User ID:", userId);
    if (userId) {
      // Charger les adresses associées à l'utilisateur connecté
      apiClient
        .get(`/adresses/user/${userId}`) // Ajouter le user_id comme paramètre de requête
        .then((response) => {
          if (Array.isArray(response.data)) {
            setAddresses(response.data);
          } else {
            setMessage("Données des adresses invalides.");
          }
        })
        .catch((error) => {
          console.error(error);
          setMessage("Erreur de récupération des adresses.");
        });
    } else {
      setMessage("Utilisateur non authentifié.");
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

          const userId = getUserIdFromToken(); // Récupérer user_id pour l'ajout
          if (userId) {
            // Ajouter l'adresse à votre propre API avec user_id
            apiClient
              .post(
                "/adresses",
                { location, user_id: userId }, // Inclure user_id dans le corps de la requête
                {
                  headers: {
                    "Content-Type": "application/ld+json", // Assurez-vous d'avoir ce Content-Type
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
                    "Une erreur est survenue lors de la connexion."
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
    apiClient
      .delete(`/adresses/${id}`)
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
  };

  return (
    <div>
      <h2>Vos adresses</h2>
      <ul>
        {addresses.length > 0 ? (
          addresses.map((address) => (
            <li key={address.id}>
              {address.location}{" "}
              <button onClick={() => handleDeleteAddress(address.id)}>
                Supprimer
              </button>
            </li>
          ))
        ) : (
          <p>Aucune adresse enregistrée.</p>
        )}
      </ul>
      <div>
        <input
          type="text"
          placeholder="Nouvelle adresse"
          value={newAddress}
          onChange={(e) => setNewAddress(e.target.value)}
        />
        <button onClick={handleAddAddress}>Ajouter</button>
      </div>
      {message && <p>{message}</p>}
    </div>
  );
};

export default AddressList;
