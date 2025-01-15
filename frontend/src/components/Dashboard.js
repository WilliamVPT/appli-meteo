import React, { useState, useEffect } from "react";
import apiClient from "../axiosConfig";
import "bootstrap/dist/css/bootstrap.min.css";

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [newUser, setNewUser] = useState({ email: "", password: "" });
  const [editUser, setEditUser] = useState({
    id: null,
    email: "",
    password: "",
  });

  useEffect(() => {
    apiClient
      .get("api/users")
      .then((response) => {
        console.log("API Response:", response.data); // Log de la réponse de l'API
        if (Array.isArray(response.data.member)) {
          const fetchAddresses = async (user) => {
            const addresses = await Promise.all(
              user.addresses.map((addressUrl) => {
                const correctedUrl = addressUrl.replace("/api/api/", "/api/");
                return apiClient.get(correctedUrl).then((res) => res.data);
              })
            );
            return { ...user, addresses };
          };

          const fetchAllUsersWithAddresses = async () => {
            const usersWithAddresses = await Promise.all(
              response.data.member.map((user) => fetchAddresses(user))
            );
            setUsers(usersWithAddresses);
          };

          fetchAllUsersWithAddresses();
        } else {
          setMessage("Données des utilisateurs invalides.");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        setMessage("Erreur lors de la récupération des utilisateurs.");
      });
  }, []);

  const handleDeleteUser = (userId) => {
    apiClient
      .delete(`api/users/${userId}`)
      .then(() => {
        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
        setMessage("Utilisateur supprimé avec succès !");
      })
      .catch((error) => {
        console.error("Error:", error);
        setMessage("Erreur lors de la suppression de l'utilisateur.");
      });
  };

  const handleDeleteAddress = (userId, addressId) => {
    apiClient
      .delete(`api/addresses/${addressId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          "Content-Type": "application/json",
        },
        data: { user_id: userId }, // Inclure user_id dans le corps de la requête
      })
      .then(() => {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === userId
              ? {
                  ...user,
                  addresses: user.addresses.filter(
                    (address) => address.id !== addressId
                  ),
                }
              : user
          )
        );
        setMessage("Adresse supprimée avec succès !");
      })
      .catch((error) => {
        console.error("Error:", error);
        setMessage("Erreur lors de la suppression de l'adresse.");
      });
  };

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

          if (selectedUserId) {
            // Ajouter l'adresse à votre propre API avec user_id
            apiClient
              .post(
                "api/adresses",
                { location, user_id: selectedUserId, coordinates }, // Inclure user_id et les coordonnées dans le corps de la requête
                {
                  headers: {
                    "Content-Type": "application/ld+json",
                  },
                }
              )
              .then((response) => {
                setUsers((prevUsers) =>
                  prevUsers.map((user) =>
                    user.id === selectedUserId
                      ? {
                          ...user,
                          addresses: [...user.addresses, response.data],
                        }
                      : user
                  )
                );
                setNewAddress("");
                setMessage("Adresse ajoutée avec succès !");
                window.location.reload(); // Recharger la page pour mettre à jour les données
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

  const handleAddUser = () => {
    if (!newUser.email.trim() || !newUser.password.trim()) {
      setMessage("Veuillez entrer un email et un mot de passe.");
      return;
    }

    apiClient
      .post("api/register", {
        email: newUser.email,
        password: newUser.password,
      })
      .then((response) => {
        setMessage("Inscription réussie !");
        window.location.reload(); // Recharger la page pour afficher le nouvel utilisateur
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

  const handleUpdateUser = () => {
    if (!editUser.email.trim()) {
      setMessage("Veuillez entrer un email.");
      return;
    }

    if (!validateEmail(editUser.email)) {
      setMessage("Veuillez entrer un email valide.");
      return;
    }

    apiClient
      .patch(`api/users/${editUser.id}`, editUser, {
        headers: {
          "Content-Type": "application/merge-patch+json", // Assurez-vous d'avoir ce Content-Type
        },
      })
      .then((response) => {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === editUser.id ? response.data : user
          )
        );
        setEditUser({ id: null, email: "", password: "", roles: [] });
        setMessage("Utilisateur mis à jour avec succès !");
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
            "Une erreur est survenue lors de la mise à jour de l'utilisateur."
        );
      });
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Tableau de bord de l'administrateur</h2>
      {message && <div className="alert alert-info">{message}</div>}
      <div className="row justify-content-center">
        <div className="col-md-8 mb-3">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Ajouter un utilisateur</h5>
              <input
                type="email"
                className="form-control mb-2"
                placeholder="Email"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
              />
              <input
                type="password"
                className="form-control mb-2"
                placeholder="Mot de passe"
                value={newUser.password}
                onChange={(e) =>
                  setNewUser({ ...newUser, password: e.target.value })
                }
              />
              <button className="btn btn-primary" onClick={handleAddUser}>
                Ajouter l'utilisateur
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="row">
        {Array.isArray(users) && users.length > 0 ? (
          users.map((user) => (
            <div key={user.id} className="col-md-6 mb-3">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">{user.email}</h5>
                  <button
                    className="btn btn-danger mt-2"
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    Supprimer l'utilisateur
                  </button>
                  <button
                    className="btn btn-secondary mt-2 ms-2"
                    onClick={() =>
                      setEditUser({
                        id: user.id,
                        email: user.email,
                        password: "",
                        roles: user.roles,
                      })
                    }
                  >
                    Modifier l'utilisateur
                  </button>
                  <h6 className="mt-3">Adresses :</h6>
                  <ul>
                    {user.addresses.map((address) => (
                      <li key={address.id}>
                        {address.location}
                        <button
                          className="btn btn-danger btn-sm ms-2"
                          onClick={() =>
                            handleDeleteAddress(user.id, address.id)
                          }
                        >
                          Supprimer l'adresse
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Nouvelle adresse"
                      value={newAddress}
                      onChange={(e) => setNewAddress(e.target.value)}
                    />
                    <button
                      className="btn btn-primary mt-2"
                      onClick={() => {
                        setSelectedUserId(user.id);
                        handleAddAddress();
                      }}
                    >
                      Ajouter une adresse (double-cliquez)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center">Aucun utilisateur trouvé.</p>
        )}
      </div>
      {editUser.id && (
        <div className="row justify-content-center mt-5">
          <div className="col-md-8">
            <div className="card border-warning">
              <div className="card-body">
                <h5 className="card-title text-warning">
                  Modifier l'utilisateur
                </h5>
                <input
                  type="email"
                  className="form-control mb-2"
                  placeholder="Email"
                  value={editUser.email}
                  onChange={(e) =>
                    setEditUser({ ...editUser, email: e.target.value })
                  }
                />
                <input
                  type="password"
                  className="form-control mb-2"
                  placeholder="Nouveau mot de passe"
                  value={editUser.password}
                  onChange={(e) =>
                    setEditUser({ ...editUser, password: e.target.value })
                  }
                />
                <select
                  className="form-control mb-2"
                  value={editUser.roles[0] || ""}
                  onChange={(e) =>
                    setEditUser({ ...editUser, roles: [e.target.value] })
                  }
                >
                  <option value="ROLE_USER">Utilisateur</option>
                  <option value="ROLE_ADMIN">Administrateur</option>
                </select>
                <button className="btn btn-warning" onClick={handleUpdateUser}>
                  Mettre à jour l'utilisateur
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
