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
   */
  public function load($vocabulary, $interactive_parent) {
    $terms = $this->entityTypeManager->getStorage('taxonomy_term')->loadTree($vocabulary);
    $tree = [];
    foreach ($terms as $tree_object) {
      $this->buildTree($tree, $tree_object, $vocabulary, 0, $interactive_parent);
    }

    return $tree;
  }

  /**
   * Populates a tree array given a taxonomy term tree object.
   *
   * @param $tree
   *   Tree param.
   * @param $object
   *   Object param.
   * @param $vocabulary
   *   Vocabulary param.
   * @param $interactive_parent
   */
  protected function buildTree(&$tree, $object, $vocabulary, $key = 0, $interactive_parent = TRUE, $depth = 0) {
    if ($object->depth != 0) {
      return;
    }
    $tree[$key] = $object;
    $tree[$key]->subitem = [];
    $tree[$key]->depth = $depth;
    $tree[$key]->parents = $object->parents[0];
    $tree[$key]->interactive_parent = $interactive_parent;
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
          $this->buildTree($object_children, $child_tree_object, $vocabulary, $key, $interactive_parent, $depth);
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
   */
  public function loadJs($vocabulary) {
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
   * @param $tree
   *   Tree param.
   * @param $object
   *   Object param.
   * @param $vocabulary
   *   Vocabulary param.
   */
  protected function buildJsTree(&$tree, $object, $vocabulary, &$key = 0, $depth = 0) {
    if ($object->depth != 0) {
      return;
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
