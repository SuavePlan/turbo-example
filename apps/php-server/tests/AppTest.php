<?php

declare(strict_types=1);

namespace Tests;

use App\App;
use PHPUnit\Framework\TestCase;
use Slim\Psr7\Factory\ServerRequestFactory;

final class AppTest extends TestCase
{
    public function test_health_reports_the_php_service(): void
    {
        $app = App::create();
        $request = (new ServerRequestFactory)->createServerRequest('GET', '/health');
        $response = $app->handle($request);

        $this->assertSame(200, $response->getStatusCode());

        $data = json_decode((string) $response->getBody(), true);
        $this->assertSame('php-server', $data['service']);
        $this->assertSame('ok', $data['status']);
    }

    public function test_api_proxy_returns_502_when_gateway_is_down(): void
    {
        putenv('API_URL=http://127.0.0.1:59999');
        $app = App::create();
        $request = (new ServerRequestFactory)->createServerRequest('GET', '/api/health');
        $response = $app->handle($request);

        $this->assertSame(502, $response->getStatusCode());
        putenv('API_URL');
    }

    public function test_health_is_localised_by_accept_language(): void
    {
        $app = App::create();

        $en = $app->handle(
            (new ServerRequestFactory)
                ->createServerRequest('GET', '/health')
                ->withHeader('Accept-Language', 'en-GB')
        );
        $this->assertSame('Service is healthy', json_decode((string) $en->getBody(), true)['message']);

        $zh = $app->handle(
            (new ServerRequestFactory)
                ->createServerRequest('GET', '/health')
                ->withHeader('Accept-Language', 'zh-CN,zh;q=0.9')
        );
        $this->assertSame('服务运行正常', json_decode((string) $zh->getBody(), true)['message']);
        $this->assertSame('zh-CN', $zh->getHeaderLine('Content-Language'));
    }
}
