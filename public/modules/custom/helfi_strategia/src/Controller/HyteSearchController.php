<?php

declare(strict_types=1);

namespace Drupal\helfi_strategia\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\helfi_api_base\Environment\EnvironmentResolverInterface;
use Drupal\helfi_api_base\Environment\Project;
use Drupal\helfi_api_base\Environment\ServiceEnum;
use Symfony\Component\HttpKernel\Exception\ServiceUnavailableHttpException;

/**
 * Controller for Hyte search page.
 */
class HyteSearchController extends ControllerBase {

  public function __construct(
    private readonly EnvironmentResolverInterface $environmentResolver,
  ) {
  }

  /**
   * Returns the search page render array.
   */
  public function searchPage(): array {
    try {
      $elasticProxyUrl = $this->environmentResolver
        ->getEnvironment(Project::ETUSIVU, $this->environmentResolver->getActiveEnvironmentName())
        ->getService(ServiceEnum::PublicElasticProxy)
        ->address
        ->getAddress();
    }
    catch (\InvalidArgumentException) {
      throw new ServiceUnavailableHttpException();
    }

    return [
      '#attached' => [
        'drupalSettings' => [
          'helfi_strategia' => [
            'hyte_search' => [
              'elastic_proxy_url' => $elasticProxyUrl,
            ],
          ],
        ],
        'library' => [
          'helfi_strategia/hyte-search',
        ],
      ],
      '#theme' => 'hyte_search',
      '#search_element' => [
        '#type' => 'html_tag',
        '#tag' => 'div',
        '#attributes' => [
          'id' => 'hyte-search',
        ],
      ],
    ];
  }

}
