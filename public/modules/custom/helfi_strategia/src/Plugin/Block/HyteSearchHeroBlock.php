<?php

declare(strict_types=1);

namespace Drupal\helfi_strategia\Plugin\Block;

use Drupal\Core\Block\Attribute\Block;
use Drupal\Core\Block\BlockBase;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\StringTranslation\TranslatableMarkup;

/**
 * Provides a 'HyteSearchHeroBlock' block.
 */
#[Block(
  id: "hyte_search_hero_block",
  admin_label: new TranslatableMarkup("Hyte search hero block"),
)]
final class HyteSearchHeroBlock extends BlockBase implements ContainerFactoryPluginInterface {

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

}
