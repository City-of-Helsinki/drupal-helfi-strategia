<?php

declare(strict_types=1);

namespace Drupal\helfi_strategia\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\helfi_strategia\ElasticProxyResolver;

/**
 * Controller for Hyte search page.
 */
class HyteSearchController extends ControllerBase {

  public function __construct(
    private readonly ElasticProxyResolver $elasticProxyResolver,
  ) {
  }

  /**
   * Returns the search page render array.
   */
  public function searchPage(): array {
    return [
      '#attached' => [
        'drupalSettings' => [
          'helfi_strategia' => [
            'hyte_search' => [
              'elastic_proxy_url' => $this->elasticProxyResolver->getElasticProxyUrl(),
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
