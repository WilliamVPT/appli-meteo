<?php

namespace App\Controller;

use App\Entity\Address;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class AddressController extends AbstractController
{
    private $logger;

    public function __construct(LoggerInterface $logger)
    {
        $this->logger = $logger;
    }

    /**
     * @Route("/api/adresses", name="address_add", methods={"POST"})
     */
    public function add(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $location = $data['location'] ?? null;
        $userId = $data['user_id'] ?? null;

        if (!$location) {
            return $this->json(['error' => 'Location is required'], 400);
        }

        if (!$userId) {
            return $this->json(['error' => 'User ID is required'], 400);
        }

        $user = $em->getRepository(User::class)->find($userId);
        if (!$user) {
            return $this->json(['error' => 'User not found'], 404);
        }

        $address = new Address();
        $address->setLocation($location);
        $address->setUser($user); // Associer l'utilisateur trouvé

        try {
            $em->persist($address);
            $em->flush();
        } catch (\Exception $e) {
            // Afficher directement l'erreur
            return $this->json(['error' => 'An error occurred while adding the address: ' . $e->getMessage()], 500);
        }

        return $this->json([
            'message' => 'Address added successfully',
            'location' => $address->getLocation(),
            'user_id' => $user->getId()
        ], 201);
    }

    /**
     * @Route("/api/adresses/user/{userId}", name="address_get_by_user", methods={"GET"})
     */
    public function getByUser(int $userId, EntityManagerInterface $em): JsonResponse
    {
        $user = $em->getRepository(User::class)->find($userId);

        if (!$user) {
            return $this->json(['error' => 'User not found'], 404);
        }

        $addresses = $em->getRepository(Address::class)->findBy(['user' => $user]);

        return $this->json($addresses, 200, [], ['groups' => ['address:read']]);
    }

    /**
     * @Route("/api/addresses/{id}", name="delete_address", methods={"DELETE"})
     */
    public function deleteAddress(int $id, Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $userId = $data['user_id'] ?? null;

        if (!$userId) {
            return $this->json(['error' => 'User ID is required'], 400);
        }

        $user = $em->getRepository(User::class)->find($userId);
        if (!$user) {
            return $this->json(['error' => 'User not found'], 404);
        }

        $address = $em->getRepository(Address::class)->find($id);

        if (!$address) {
            return $this->json(['error' => 'Address not found'], 404);
        }

        if ($address->getUser() !== $user) {
            return $this->json(['error' => 'Unauthorized'], 403);
        }

        $em->remove($address);
        $em->flush();

        return $this->json(['message' => 'Address deleted'], 200);
    }

    /**
     * @Route("/api/adresses", name="get_addresses", methods={"GET"})
     */
    public function getAddresses(EntityManagerInterface $em): JsonResponse
    {
        $user = $this->getUser();

        if (!$user) {
            return $this->json(['error' => 'User not authenticated'], 401);
        }

        $addresses = $em->getRepository(Address::class)->findBy(['user' => $user]);

        return $this->json($addresses, 200, [], ['groups' => ['address:read']]);
    }
}
