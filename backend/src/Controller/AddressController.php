<?php

namespace App\Controller;

use App\Entity\Address;
use App\Repository\AddressRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/addresses', name: 'address_')]
#[IsGranted('ROLE_USER')]
class AddressController extends AbstractController
{
    #[Route('', name: 'list', methods: ['GET'])]
    public function list(AddressRepository $repository): JsonResponse
    {
        $user = $this->getUser();
        $addresses = $repository->findBy(['user' => $user]);

        return $this->json($addresses, 200);
    }

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
        $address->setUser($this->getUser());

        $em->persist($address);
        $em->flush();

        return $this->json($address, 201);
    }

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
}
