<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;
use ApiPlatform\Metadata\ApiResource;
use App\Repository\AddressRepository;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\Post;

#[ORM\Entity(repositoryClass: AddressRepository::class)]
#[ApiResource(
    operations: [
        new Get(
            uriTemplate: '/api/adresses',
            normalizationContext: ['groups' => ['address:read']]
        ),
        new Post(
            uriTemplate: '/api/adresses',
            inputFormats: ['jsonld' => ['application/ld+json']],
            outputFormats: ['jsonld' => ['application/ld+json']],
            normalizationContext: ['groups' => ['address:read']],
            denormalizationContext: ['groups' => ['address:write']]
        )
    ],
    normalizationContext: ['groups' => ['address:read']],
    denormalizationContext: ['groups' => ['address:write']]
)]
class Address
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    #[Groups(['address:read'])]
    private ?int $id = null;

    #[ORM\Column(type: 'string', length: 255)]
    #[Assert\NotBlank]
    #[Groups(['address:read', 'address:write'])]
    private ?string $location = null;

    #[ORM\ManyToOne(targetEntity: User::class, inversedBy: 'addresses')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['address:read', 'address:write'])]
    private ?User $user = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getLocation(): ?string
    {
        return $this->location;
    }

    public function setLocation(string $location): self
    {
        $this->location = $location;

        return $this;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): self
    {
        $this->user = $user;

        return $this;
    }
}
