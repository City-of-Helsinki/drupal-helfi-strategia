<?php

declare(strict_types=1);

namespace Drupal\helfi_strategia\Controller;

use Drupal\Core\Controller\ControllerBase;

/**
 * Controller for Hyte search page.
 */
class HyteSearchController extends ControllerBase {

  /**
   * Returns the search page render array.
   */
  public function searchPage(): array {
    return [
      '#attached' => [
        'library' => [
          'hdbt_subtheme/hyte-search',
        ],
      ],
      '#description' => $this->t(
        'Find wellbeing services in Helsinki near you by entering your address, entering a search term, or selecting one of the themes.',
        [],
        ['context' => 'Hyte search']
      ),
      '#theme' => 'hyte_search',
      '#search_element' => [
        '#type' => 'html_tag',
        '#tag' => 'div',
        '#attributes' => [
          'id' => 'hyte-search',
          'data-url' => $this->config('elastic_proxy.settings')?->get('elastic_proxy_url'),
        ],
      ],
    ];
  }

}
