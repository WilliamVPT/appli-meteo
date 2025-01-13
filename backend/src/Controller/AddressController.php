<?php

namespace App\Controller;

use App\Entity\Address;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class AddressController extends AbstractController
{
    /**
     * @Route("/api/adresses", name="address_add", methods={"POST"})
     */
    public function add(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $location = $data['location'] ?? null;

        if (!$location) {
            return $this->json(['error' => 'Location is required'], 400);
        }

        $address = new Address();
        $address->setLocation($location);
        $address->setUser($this->getUser()); // Associer l'utilisateur connecté

        try {
            $em->persist($address);
            $em->flush();
        } catch (\Exception $e) {
            // Log the error message
            $this->get('logger')->error('Error adding address: ' . $e->getMessage());
            return $this->json(['error' => 'An error occurred while adding the address.'], 500);
        }

        return $this->json(['message' => 'Address added successfully'], 201);
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
     * @Route("/api/adresses/{id}", name="delete_address", methods={"DELETE"})
     */
    public function deleteAddress(int $id, EntityManagerInterface $em): JsonResponse
    {
        $user = $this->getUser();

        if (!$user) {
            return $this->json(['error' => 'User not authenticated'], 401);
        }

        $address = $em->getRepository(Address::class)->find($id);

        if (!$address || $address->getUser() !== $user) {
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
