<?php
namespace Drupal\helfi_ahjo\Utils;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\helfi_ahjo\Services\AhjoService;

/**
 * Class TaxonomyUtils to create taxonomy tree.
 */
class TaxonomyUtils {

  /**
   * Entity type manager.
   *
   * @var \Drupal\Core\Entity\EntityTypeManagerInterface
   */
  protected $entityTypeManager;

  /**
   * TaxonomyUtils constructor.
   *
   * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entityTypeManager
   *   Entity type manager.
   */
  public function __construct(EntityTypeManagerInterface $entityTypeManager) {
    $this->entityTypeManager = $entityTypeManager;
  }

  /**
   * Loads the tree of a vocabulary.
   *
   * @param string $vocabulary
   *   Machine name.
   *
   * @return array
   *   Return array of vocabulary tree.
   */
  public function load(string $vocabulary): array {
    $terms = $this->entityTypeManager->getStorage('taxonomy_term')->loadTree($vocabulary);
    $tree = [];
    foreach ($terms as $tree_object) {
      $this->buildTree($tree, $tree_object, $vocabulary, 0);
    }

    return $tree;
  }

  /**
   * Populates a tree array given a taxonomy term tree object.
   *
   * @param array $tree
   *   Tree param.
   * @param object $object
   *   Object param.
   * @param string $vocabulary
   *   Vocabulary param.
   * @param int $key
   *   Key for tree.
   * @param int $depth
   *   Depth for tree.
   */
  protected function buildTree(array &$tree, object $object, string $vocabulary, int $key = 0, int $depth = 0) {
    if ($object->depth != 0) {
      return;
    }
    $tree[$key] = $object;
    $tree[$key]->subitem = [];
    $tree[$key]->depth = $depth;
    $tree[$key]->parents = $object->parents[0];
    $object_children = &$tree[$key]->subitem;

    $children = $this->entityTypeManager->getStorage('taxonomy_term')->loadChildren($object->tid);
    if (!$children) {
      return;
    }
    $tree[$key]->subitems_number = count($children);
    $child_tree_objects = $this->entityTypeManager->getStorage('taxonomy_term')->loadTree($vocabulary, $object->tid);
    $key = 0;
    $depth++;

    foreach ($children as $child) {
      foreach ($child_tree_objects as $child_tree_object) {
        if ($child_tree_object->tid == $child->id()) {
          $this->buildTree($object_children, $child_tree_object, $vocabulary, $key, $depth);
          $key++;
        }
      }
    }
  }

  /**
   * Loads the tree of a vocabulary.
   *
   * @param string $vocabulary
   *   Machine name.
   *
   * @return array
   *   Return array of vocabulary tree.
   */
  public function loadJs(string $vocabulary): array {
    $terms = $this->entityTypeManager->getStorage('taxonomy_term')->loadTree($vocabulary);
    $tree = [];
    foreach ($terms as $tree_object) {
      $this->buildJsTree($tree, $tree_object, $vocabulary);
    }

    return $tree;
  }

  /**
   * Populates a tree array given a taxonomy term tree object.
   *
   * @param array $tree
   *   Tree param.
   * @param object $object
   *   Object param.
   * @param string $vocabulary
   *   Vocabulary param.
   * @param int $key
   *   Key for tree.
   * @param int $depth
   *   Depth for tree.
   */
  protected function buildJsTree(array &$tree, object $object, string $vocabulary, int &$key = 0, int $depth = 0) {
    if ($object->depth != 0) {
      return [];
    }

    $tree[$key] = [
      'id' => $object->tid,
      'pid' => $object->parents[0],
      'name' => $object->name,
    ];

    $object_children = &$tree;

    $children = $this->entityTypeManager->getStorage('taxonomy_term')->loadChildren($object->tid);
    if (!$children) {
      return;
    }

    $child_tree_objects = $this->entityTypeManager->getStorage('taxonomy_term')->loadTree($vocabulary, $object->tid);

    $depth++;
    if ($depth == \Drupal::service('helfi_ahjo.ahjo_service')->getConfig()->get('organigram_max_depth')) {
      return;
    }
    foreach ($children as $child) {
      foreach ($child_tree_objects as $child_tree_object) {
        if ($child_tree_object->tid == $child->id()) {
          $key++;
          $this->buildJsTree($object_children, $child_tree_object, $vocabulary, $key, $depth);
        }
      }
    }
  }

}
