import axios from "axios";

// Création d'une instance Axios
const apiClient = axios.create({
  baseURL: "http://localhost:8000/", // URL de base de l'API
  headers: {
    "Content-Type": "application/json",
  },
});

// Intercepteur pour inclure le token dans les requêtes
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken"); // Récupérer le token depuis localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Ajouter l'en-tête Authorization
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs de réponse
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Si une requête échoue avec un statut 401 (non autorisé), déconnecter l'utilisateur
      localStorage.removeItem("authToken");
      localStorage.setItem("isConnected", "false");
      window.location.href = "/login"; // Redirige vers la page de connexion
    }
    return Promise.reject(error);
  }
);

export default apiClient;
