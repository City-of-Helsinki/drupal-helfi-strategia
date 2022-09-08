<?php

namespace Drupal\helfi_ahjo\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Component\Serialization\Json;
use Drupal\Core\Cache\Cache;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Extension\ModuleExtensionList;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\helfi_ahjo\Services\AhjoService;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\taxonomy\Entity\Term;
use Drupal\Core\Database\Connection;
use Drupal\Core\Entity\EntityTypeBundleInfoInterface;
use Drupal\Core\Entity\EntityFieldManagerInterface;
use Drupal\Core\Routing\ResettableStackedRouteMatchInterface;

/**
 * Provides a 'Hello' Block.
 *
 * @Block(
 *   id = "sote_section",
 *   admin_label = @Translation("Sote Section"),
 *   category = @Translation("HELfi"),
 * )
 */
class SoteSection extends BlockBase implements ContainerFactoryPluginInterface {

  /**
   * Ahjo Service.
   *
   * @var \Drupal\helfi_ahjo\Services\AhjoService
   */
  protected $ahjoService;


  /**
   * ClientFactory constructor.
   *
   * @param array $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $plugin_id
   *   The plugin_id for the plugin instance.
   * @param array $plugin_definition
   *   The plugin implementation definition.
   * @param \Drupal\helfi_ahjo\Services\AhjoService $ahjoService
   *   The module extension list.
   */
  public function __construct(array $configuration,
                                    $plugin_id,
                              array $plugin_definition,
                              AhjoService $ahjoService) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->ahjoService = $ahjoService;

  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('helfi_ahjo.ahjo_service')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function build() {
    $max_age = 0;

    return [
      '#theme' => 'hierarchical_taxonomy_tree',
      '#menu_tree' => $this->ahjoService->showDataAsTree(),
      '#cache' => [
        'max-age' => $max_age,
        'tags' => [
          'taxonomy_term_list',
        ],
      ],
      '#current_depth' => 0,
      '#vocabulary' => 'sote_section',
      '#max_depth' => 500,
      '#collapsible' => 1,
      '#attached' => [
        'library' => [
          'helfi_ahjo/hierarchical_taxonomy_tree',
        ],
      ],
    ];

  }

}


