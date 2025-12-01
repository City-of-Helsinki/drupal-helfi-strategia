<?php

declare(strict_types=1);

namespace Drupal\helfi_strategia\Plugin\Block;

use Drupal\Core\Block\Attribute\Block;
use Drupal\Core\Block\BlockBase;
use Drupal\Core\Cache\Cache;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\Routing\RouteMatchInterface;
use Drupal\Core\StringTranslation\TranslatableMarkup;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Provides a 'HyteSearchHeroBlock' block.
 */
#[Block(
  id: "hyte_search_hero_block",
  admin_label: new TranslatableMarkup("Hyte search hero block"),
)]
final class HyteSearchHeroBlock extends BlockBase implements ContainerFactoryPluginInterface {

  /**
   * The route match.
   */
  private RouteMatchInterface $routeMatch;

  /**
   * {@inheritdoc}
   */
  public static function create(
    ContainerInterface $container,
    $configuration,
    $plugin_id,
    $plugin_definition,
  ) : self {
    $instance = new self(
      $configuration,
      $plugin_id,
      $plugin_definition
    );

    $instance->routeMatch = $container->get(RouteMatchInterface::class);

    return $instance;
  }

  /**
   * {@inheritdoc}
   */
  public function build() : array {
    $title = new TranslatableMarkup('Find wellbeing services');
    $build['hyte_search_hero_block'] = [
      '#theme' => 'hyte_search_hero_block',
      '#hero_title' => $title,
      '#first_paragraph_bg' => TRUE,
    ];

    return $build;
  }

  /**
   * {@inheritdoc}
   */
  public function getCacheContexts() : array {
    return Cache::mergeContexts(parent::getCacheContexts(), ['route']);
  }

}
