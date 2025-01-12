<?php

namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;

class AuthController extends AbstractController
{
    private $em;
    private $JWTManager;

    public function __construct(EntityManagerInterface $em, JWTTokenManagerInterface $JWTManager)
    {
        $this->em = $em;
        $this->JWTManager = $JWTManager;
    }

    /**
     * @Route("/api/register", name="api_register", methods={"POST", "OPTIONS"})
     */
    public function register(
        Request $request,
        UserPasswordHasherInterface $passwordHasher
    ): JsonResponse {
        if ($request->isMethod('OPTIONS')) {
            // Répondre à la requête OPTIONS pour CORS
            return $this->handleCorsResponse();
        }

        try {
            $data = json_decode($request->getContent(), true);
            $email = $data['email'] ?? null;
            $password = $data['password'] ?? null;

            if (!$email || !$password) {
                return new JsonResponse(['error' => 'Email et mot de passe requis'], 400);
            }

            // Assurer que l'email est unique
            $existingUser = $this->em->getRepository(User::class)->findOneBy(['email' => $email]);
            if ($existingUser) {
                return new JsonResponse(['error' => 'Cet email est déjà utilisé'], 400);
            }

            $user = new User();
            $user->setEmail($email);
            $user->setPassword($passwordHasher->hashPassword($user, $password));
            $this->em->persist($user);
            $this->em->flush();

            return $this->handleCorsResponse(new JsonResponse(['message' => 'Inscription réussie'], 201));
        } catch (\Exception $e) {
            return $this->handleCorsResponse(new JsonResponse(['error' => 'Une erreur est survenue : ' . $e->getMessage()], 500));
        }
    }

    /**
     * @Route("/api/login", name="api_login", methods={"POST", "OPTIONS"})
     */
    public function login(Request $request): JsonResponse
    {
        if ($request->getMethod() === 'OPTIONS') {
            return $this->handleCorsResponse();
        }

        $data = json_decode($request->getContent(), true);
        $email = $data['email'] ?? null;
        $password = $data['password'] ?? null;

        if (!$email || !$password) {
            return $this->handleCorsResponse(new JsonResponse(['error' => 'Email et mot de passe requis'], 400));
        }

        $user = $this->em->getRepository(User::class)->findOneBy(['email' => $email]);

        if (!$user || !password_verify($password, $user->getPassword())) {
            return $this->handleCorsResponse(new JsonResponse(['error' => 'Identifiants incorrects'], 401));
        }

        // Générer le jeton JWT
        $token = $this->JWTManager->create($user);

        return $this->handleCorsResponse(new JsonResponse(['token' => $token], 200));
    }

    /**
     * Gère les en-têtes CORS dans la réponse.
     * 
     * @param JsonResponse|null $response
     * @return JsonResponse
     */
    private function handleCorsResponse(JsonResponse $response = null): JsonResponse
    {
        if ($response === null) {
            $response = new JsonResponse();
        }

        $response->headers->set('Access-Control-Allow-Origin', '*');
        $response->headers->set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, DELETE');
        $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        return $response;
    }
}
