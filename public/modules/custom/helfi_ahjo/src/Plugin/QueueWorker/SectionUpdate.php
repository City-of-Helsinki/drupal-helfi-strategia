<?php

namespace Drupal\helfi_ahjo\Plugin\QueueWorker;

use Drupal\Core\DependencyInjection\ContainerInjectionInterface;
use Drupal\Core\Extension\ModuleExtensionList;
use Drupal\Core\Queue\QueueWorkerBase;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * A worker that updates metadata for every image.
 *
 * @QueueWorker(
 *   id = "sote_section_update",
 *   title = @Translation("SOTE Section Update"),
 *   cron = {"time" = 90}
 * )
 */
class SectionUpdate extends QueueWorkerBase implements ContainerInjectionInterface {

  /**
   * Constructor.
   *
   * @param array $configuration
   *   Configuration.
   * @param string $plugin_id
   *   Plugin ID.
   * @param mixed $plugin_definition
   *   Plugin definition.
   */
  public function __construct(
    array $configuration,
    $plugin_id,
    $plugin_definition) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return $container;
  }

  /**
   * {@inheritDoc}
   */
  public function processItem($data) {
    $sote_section_term_by_external_id = \Drupal::entityTypeManager()->getStorage('taxonomy_term')->loadByProperties([
      'vid' => 'sote_section',
      'field_external_id' => $data['ID'],
    ]);
    if (reset($sote_section_term_by_external_id)->name->value != $data['Name']) {
      reset($sote_section_term_by_external_id)->set('name', $data['Name']);
      reset($sote_section_term_by_external_id)->save();
    }
  }

}
