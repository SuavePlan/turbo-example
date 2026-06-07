<?php

declare(strict_types=1);

namespace App;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\App as SlimApp;
use Slim\Factory\AppFactory;

/**
 * The PHP surface of the monorepo. It is a first-class participant in the same
 * workflow: /health reports liveness and /api/* proxies to the Hono gateway,
 * so a PHP front-door can reuse the TypeScript + Python pipeline.
 */
final class App
{
    public static function create(): SlimApp
    {
        $app = AppFactory::create();
        $app->addBodyParsingMiddleware();

        $app->get('/health', function (Request $request, Response $response): Response {
            $payload = [
                'status' => 'ok',
                'service' => 'php-server',
                'version' => '0.0.0',
            ];
            $response->getBody()->write((string) json_encode($payload));

            return $response->withHeader('Content-Type', 'application/json');
        });

        // Proxy: GET /api/health -> {API_URL}/health, etc.
        $app->get('/api/{path:.*}', function (Request $request, Response $response, array $args): Response {
            $base = rtrim(getenv('API_URL') ?: 'http://localhost:3000', '/');
            $url = $base.'/'.($args['path'] ?? '');
            $body = @file_get_contents($url);

            if ($body === false) {
                $response->getBody()->write((string) json_encode(['error' => "api unreachable at {$base}"]));

                return $response->withStatus(502)->withHeader('Content-Type', 'application/json');
            }

            $response->getBody()->write($body);

            return $response->withHeader('Content-Type', 'application/json');
        });

        return $app;
    }
}
