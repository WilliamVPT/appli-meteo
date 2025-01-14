<?php
// src/Controller/UserController.php

namespace App\Controller;

use App\Entity\User;
use App\Entity\Address;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

class UserController extends AbstractController
{
    /**
     * @Route("/api/users", name="get_users", methods={"GET"})
     */
    public function getUsers(EntityManagerInterface $em): JsonResponse
    {
        $users = $em->getRepository(User::class)->findAll();
        $data = [];

        foreach ($users as $user) {
            $addresses = $em->getRepository(Address::class)->findBy(['user' => $user]);
            $data[] = [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'addresses' => array_map(function ($address) {
                    return [
                        'id' => $address->getId(),
                        'location' => $address->getLocation(),
                    ];
                }, $addresses),
            ];
        }

        return $this->json($data);
    }

    /**
     * @Route("/api/users/{id}", name="delete_user", methods={"DELETE"})
     */
    public function deleteUser(int $id, EntityManagerInterface $em): JsonResponse
    {
        $user = $em->getRepository(User::class)->find($id);

        if (!$user) {
            return $this->json(['error' => 'User not found'], 404);
        }

        $addresses = $em->getRepository(Address::class)->findBy(['user' => $user]);

        foreach ($addresses as $address) {
            $em->remove($address);
        }

        $em->remove($user);
        $em->flush();

        return $this->json(['message' => 'User and addresses deleted']);
    }

    /**
     * @Route("/api/users/{userId}/addresses/{addressId}", name="delete_address", methods={"DELETE"})
     */
    public function deleteAddress(int $userId, int $addressId, EntityManagerInterface $em): JsonResponse
    {
        $user = $em->getRepository(User::class)->find($userId);
        $address = $em->getRepository(Address::class)->find($addressId);

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
     * @Route("/api/users/{id}", name="update_user", methods={"PATCH"})
     */
    public function updateUser(int $id, Request $request, EntityManagerInterface $em, UserPasswordEncoderInterface $passwordEncoder): JsonResponse
    {
        $user = $em->getRepository(User::class)->find($id);

        if (!$user) {
            return $this->json(['error' => 'User not found'], 404);
        }

        $data = json_decode($request->getContent(), true);

        if (!empty($data['email'])) {
            $user->setEmail($data['email']);
        }

        if (!empty($data['password'])) {
            $user->setPassword($passwordEncoder->encodePassword($user, $data['password']));
        }

        if (!empty($data['roles'])) {
            $user->setRoles($data['roles']);
        }

        $em->flush();

        return $this->json([
            'id' => $user->getId(),
            'email' => $user->getEmail(),
            'roles' => $user->getRoles(),
        ]);
    }
}
