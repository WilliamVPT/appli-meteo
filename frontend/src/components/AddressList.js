import React, { useState, useEffect } from "react";
import apiClient from "../axiosConfig";

const AddressList = () => {
  const [addresses, setAddresses] = useState([]);
  const [newAddress, setNewAddress] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Charger les adresses associées à l'utilisateur
    apiClient
      .get("/addresses")
      .then((response) => {
        // Vérifier si response.data est bien un tableau
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
  }, []);

  const handleAddAddress = () => {
    if (!newAddress.trim()) {
      setMessage("Veuillez entrer une adresse.");
      return;
    }
  
    // Rechercher l'adresse via l'API Adresse.data.gouv.fr
    apiClient
      .get(`https://api-adresse.data.gouv.fr/search/?q=${newAddress}&limit=1`) // URL de l'API
      .then((response) => {
        // Vérifier si l'API retourne des résultats
        if (response.data && response.data.features.length > 0) {
          const addressData = response.data.features[0]; // Prendre la première adresse retournée
          const location = addressData.properties.label;
  
          // Ajouter l'adresse à votre propre API
          apiClient
            .post("/addresses", { location })
            .then((response) => {
              setAddresses((prevAddresses) => [...prevAddresses, response.data]);
              setNewAddress("");
              setMessage("Adresse ajoutée !");
            })
            .catch((error) => {
              console.error(error);
              setMessage("Erreur lors de l'ajout de l'adresse.");
            });
        } else {
          setMessage("Aucune adresse trouvée.");
        }
      })
      .catch((error) => {
        console.error(error);
        setMessage("Erreur lors de la recherche de l'adresse.");
      });
  };
  
  

  const handleDeleteAddress = (id) => {
    apiClient
      .delete(`/addresses/${id}`)
      .then(() => {
        setAddresses(addresses.filter((address) => address.id !== id));
        setMessage("Adresse supprimée !");
      })
      .catch((error) => setMessage("Erreur lors de la suppression."));
  };

  return (
    <div>
      <h2>Vos adresses</h2>
      <ul>
        {Array.isArray(addresses) && addresses.length === 0 ? (
          addresses.map((address) => (
            <li key={address.id}>
              {address.location}{" "}
              <button onClick={() => handleDeleteAddress(address.id)}>
                Supprimer
              </button>
            </li>
          ))
        ) : (
          <p>Les adresses ne sont pas disponibles.</p>
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
