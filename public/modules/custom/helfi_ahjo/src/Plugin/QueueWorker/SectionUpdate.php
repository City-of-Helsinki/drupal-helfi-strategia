<?php

namespace Drupal\helfi_ahjo\Plugin\QueueWorker;

use Drupal\Core\DependencyInjection\ContainerInjectionInterface;
use Drupal\Core\Extension\ModuleExtensionList;
use Drupal\Core\Queue\QueueWorkerBase;
use Drupal\taxonomy\Entity\Term;
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
class SectionUpdate extends QueueWorkerBase {

  /**
   * {@inheritDoc}
   */
  public function processItem($data) {
    $loadByExternalId = \Drupal::entityTypeManager()->getStorage('taxonomy_term')->loadByProperties([
      'vid' => 'sote_section',
      'field_external_id' => $data['ID'],
    ]);
    foreach ($loadByExternalId as $term) {
      $loadTerm = Term::load($term->id());

      $loadTerm->set('name', $data['Name']);
      if (isset($data['parentId'])) {
        $loadTerm->set('parent', $data['parentId']);
        $loadTerm->set('parent', $data['parentId']);
      }
      $loadTerm->set('field_section_type', $data['Type']);
      $loadTerm->set('field_section_type_id', $data['TypeId']);
      $loadTerm->save();

    }
  }

}
