<?php

declare(strict_types=1);

namespace App;

/**
 * Minimal i18n mirroring the server-facing keys from the shared @repo/i18n
 * catalog, so the PHP server answers in the caller's language (Accept-Language).
 */
final class I18n
{
    private const DEFAULT_LOCALE = 'en-GB';

    private const MESSAGES = [
        'en-GB' => [
            'healthy' => 'Service is healthy',
            'upstreamUnreachable' => 'The API is unreachable at {url}.',
        ],
        'zh-CN' => [
            'healthy' => '服务运行正常',
            'upstreamUnreachable' => '无法连接接口：{url}。',
        ],
    ];

    public static function resolve(?string $acceptLanguage): string
    {
        if ($acceptLanguage === null || $acceptLanguage === '') {
            return self::DEFAULT_LOCALE;
        }

        $ranked = [];
        foreach (explode(',', $acceptLanguage) as $part) {
            $bits = array_map('trim', explode(';', $part));
            $tag = strtolower($bits[0]);
            $weight = 1.0;
            foreach (array_slice($bits, 1) as $b) {
                if (str_starts_with($b, 'q=')) {
                    $weight = (float) substr($b, 2);
                }
            }
            if ($tag !== '') {
                $ranked[] = ['weight' => $weight, 'tag' => $tag];
            }
        }

        usort($ranked, static fn (array $a, array $b): int => $b['weight'] <=> $a['weight']);

        foreach ($ranked as $entry) {
            if (str_starts_with($entry['tag'], 'zh')) {
                return 'zh-CN';
            }
            if (str_starts_with($entry['tag'], 'en')) {
                return 'en-GB';
            }
        }

        return self::DEFAULT_LOCALE;
    }

    public static function t(string $locale, string $key, array $params = []): string
    {
        $table = self::MESSAGES[$locale] ?? self::MESSAGES[self::DEFAULT_LOCALE];
        $text = $table[$key] ?? self::MESSAGES[self::DEFAULT_LOCALE][$key] ?? $key;
        foreach ($params as $name => $value) {
            $text = str_replace('{'.$name.'}', (string) $value, $text);
        }

        return $text;
    }
}
