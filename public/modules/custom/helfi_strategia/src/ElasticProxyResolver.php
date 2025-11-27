<?php

declare(strict_types=1);

namespace Drupal\helfi_strategia;

use Drupal\helfi_api_base\Environment\EnvironmentEnum;
use Drupal\helfi_api_base\Environment\EnvironmentResolver;
use Drupal\helfi_api_base\Environment\Project;
use Drupal\helfi_api_base\Environment\ServiceEnum;

/**
 * Resolves Elastic Proxy URL based on environment.
 *
 * @package Drupal\helfi_strategia
 */
class ElasticProxyResolver {

  public function __construct(
    private readonly EnvironmentResolver $environmentResolver,
  ) {
  }

  /**
   * Get Elastic Proxy URL based on current environment.
   *
   * @return string
   *   The Elastic Proxy URL.
   */
  public function getElasticProxyUrl(): string {
    $currentEnvironment = $this->environmentResolver->getActiveEnvironmentName();

    // Environmentresolver returns docker network url for local environment,
    // we need to be able to access from browser.
    if ($currentEnvironment === EnvironmentEnum::Local->value) {
      return 'https://elastic-proxy-helfi-etusivu.docker.so';
    }

    try {
      $environment = $this->environmentResolver->getEnvironment(
        Project::ETUSIVU, $currentEnvironment
      );
    }
    catch (\InvalidArgumentException) {
      $environment = $this->environmentResolver->getEnvironment(Project::ETUSIVU, EnvironmentEnum::Prod->value);
    }

    return $environment->getService(ServiceEnum::ElasticProxy)->address->getAddress();
  }

}
