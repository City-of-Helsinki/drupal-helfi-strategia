<?php

namespace Drupal\helfi_ahjo\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\helfi_ahjo\Services\AhjoService;
use Drupal\helfi_ahjo\Utils\TaxonomyUtils;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Provides route responses for organigrams.module.
 */
class OrganizationChart extends ControllerBase {

  /**
   * Ahjo Service.
   *
   * @var \Drupal\helfi_ahjo\Services\AhjoService
   */
  protected $ahjoService;

  /**
   * Taxonomy utils.
   *
   * @var \Drupal\helfi_ahjo\Utils\TaxonomyUtils
   */
  protected $taxonomyUtils;

  /**
   * Constructs a OrganigramsController object.
   *
   * @param \Drupal\helfi_ahjo\Services\AhjoService $ahjoService
   *   The module extension list.
   * @param \Drupal\helfi_ahjo\Utils\TaxonomyUtils $taxonomyUtils
   *   Taxonomy utils for tree.
   */
  public function __construct(AhjoService $ahjoService, TaxonomyUtils $taxonomyUtils) {
    $this->ahjoService = $ahjoService;
    $this->taxonomyUtils = $taxonomyUtils;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('helfi_ahjo.ahjo_service'),
      $container->get('helfi_ahjo.taxonomy_utils')
    );
  }

  /**
   * Returns a form to add a new term to a vocabulary.
   *
   */
  public function viewOrganigram() {
    $max_age = 0;
//    dump(count($this->taxonomyUtils->loadJs('sote_section')));
    return [
      '#theme' => 'organigram_container',
      '#cache' => [
        'max-age' => $max_age,
        'tags' => [
          'taxonomy_term_list',
        ],
      ],
      '#attached' => [
        'library' => [
          'helfi_ahjo/organigram',
        ],
        'drupalSettings' => [
          'helfi_ahjo' => $this->taxonomyUtils->loadJs('sote_section'),
        ],
      ],
    ];
  }

}
