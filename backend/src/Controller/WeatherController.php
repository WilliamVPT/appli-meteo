<?php

namespace App\Controller;

use App\Service\OpenMeteoService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

class WeatherController extends AbstractController
{
    private OpenMeteoService $openMeteoService;

    public function __construct(OpenMeteoService $openMeteoService)
    {
        $this->openMeteoService = $openMeteoService;
    }

    #[Route('/api/weather', methods: ['GET'])]
    public function getWeather(): JsonResponse
    {
        $weatherData = $this->openMeteoService->getWeather('Reims');
        return $this->json($weatherData);
    }
}
