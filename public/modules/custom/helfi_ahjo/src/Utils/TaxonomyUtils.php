<?php
namespace Drupal\helfi_ahjo\Utils;

use Drupal\Core\Entity\EntityTypeManagerInterface;

/**
 * Class TaxonomyUtils to create taxonomy tree.
 */
class TaxonomyUtils {

  /**
   * TaxonomyUtils constructor.
   *
   * @param EntityTypeManagerInterface $entityTypeManager
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
  protected function buildTree(&$tree, $object, $vocabulary, $key = 0, $interactive_parent = TRUE) {
    if ($object->depth != 0) {
      return;
    }
    $tree[$key] = $object;
    $tree[$key]->subitem = [];
    $tree[$key]->interactive_parent = $interactive_parent;
    $object_children = &$tree[$key]->subitem;

    $children = $this->entityTypeManager->getStorage('taxonomy_term')->loadChildren($object->tid);
    if (!$children) {
      return;
    }

    $child_tree_objects = $this->entityTypeManager->getStorage('taxonomy_term')->loadTree($vocabulary, $object->tid);
    $key = 0;
    foreach ($children as $child) {
      foreach ($child_tree_objects as $child_tree_object) {
        if ($child_tree_object->tid == $child->id()) {
          $this->buildTree($object_children, $child_tree_object, $vocabulary, $key, $interactive_parent);
          $key++;
        }
      }
    }
  }

}
