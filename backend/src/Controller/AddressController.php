<?php

namespace App\Controller;

use App\Entity\Address;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/adresses', name: 'address_')]
class AddressController extends AbstractController
{
    // Ajouter une adresse
    #[Route('', name: 'add', methods: ['POST'])]
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

        $em->persist($address);
        $em->flush();

        return $this->json($address, 201, [], ['groups' => ['address:read']]);
    }

    // Supprimer une adresse
    #[Route('/{id}', name: 'delete', methods: ['DELETE'])]
    public function delete(Address $address, EntityManagerInterface $em): JsonResponse
    {
        $user = $this->getUser();

        if ($address->getUser() !== $user) {
            return $this->json(['error' => 'Unauthorized'], 403);
        }

        $em->remove($address);
        $em->flush();

        return $this->json(['message' => 'Address deleted'], 200);
    }

    // Récupérer les adresses par utilisateur
    #[Route('', name: 'get_addresses', methods: ['GET'])]
    public function getAddresses(EntityManagerInterface $em): JsonResponse
    {
        $user = $this->getUser();

        if (!$user) {
            return $this->json(['error' => 'User not authenticated'], 401);
        }

        // Récupérer toutes les adresses liées à l'utilisateur connecté
        $addresses = $em->getRepository(Address::class)->findBy(['user' => $user]);

        return $this->json($addresses, 200, [], ['groups' => ['address:read']]);
    }
}
