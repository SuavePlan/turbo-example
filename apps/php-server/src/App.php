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
            $locale = I18n::resolve($request->getHeaderLine('Accept-Language'));
            $payload = [
                'status' => 'ok',
                'service' => 'php-server',
                'version' => '0.0.0',
                'message' => I18n::t($locale, 'healthy'),
            ];
            $response->getBody()->write((string) json_encode($payload));

            return $response
                ->withHeader('Content-Type', 'application/json')
                ->withHeader('Content-Language', $locale);
        });

        // Proxy: GET /api/health -> {API_URL}/health, etc.
        $app->get('/api/{path:.*}', function (Request $request, Response $response, array $args): Response {
            $locale = I18n::resolve($request->getHeaderLine('Accept-Language'));
            $base = rtrim(getenv('API_URL') ?: 'http://localhost:3000', '/');
            $url = $base.'/'.($args['path'] ?? '');
            $body = @file_get_contents($url);

            if ($body === false) {
                $error = I18n::t($locale, 'upstreamUnreachable', ['url' => $base]);
                $response->getBody()->write((string) json_encode(['error' => $error]));

                return $response
                    ->withStatus(502)
                    ->withHeader('Content-Type', 'application/json')
                    ->withHeader('Content-Language', $locale);
            }

            $response->getBody()->write($body);

            return $response->withHeader('Content-Type', 'application/json');
        });

        return $app;
    }
}
