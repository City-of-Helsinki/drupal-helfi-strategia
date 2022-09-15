<?php

namespace Drupal\helfi_ahjo\Services;

use Drupal\Component\Serialization\Json;
use Drupal\Core\Config\ImmutableConfig;
use Drupal\Core\DependencyInjection\ContainerInjectionInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Extension\ModuleExtensionList;
use Drupal\helfi_ahjo\AhjoServiceInterface;
use Drupal\helfi_ahjo\Utils\TaxonomyUtils;
use Drupal\taxonomy\Entity\Term;
use Drupal\taxonomy\Entity\Vocabulary;
use GuzzleHttp\ClientInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Class AHJO Service.
 *
 * Factory class for Client.
 */
class AhjoService implements ContainerInjectionInterface, AhjoServiceInterface {

  /**
   * The module extension list.
   *
   * @var \Drupal\Core\Extension\ModuleExtensionList
   */
  protected $moduleExtensionList;

  /**
   * Taxonomy utils.
   *
   * @var \Drupal\helfi_ahjo\Utils\TaxonomyUtils
   */
  protected $taxonomyUtils;

  /**
   * The entity type manager.
   *
   * @var \Drupal\Core\Entity\EntityTypeManagerInterface
   */
  protected $entityTypeManager;

  /**
   * A fully-configured Guzzle client to pass to the dam client.
   *
   * @var \GuzzleHttp\ClientInterface
   */
  protected $guzzleClient;

  /**
   * AHJO Service constructor.
   *
   * @param \Drupal\Core\Extension\ModuleExtensionList $extension_list_module
   *   The module extension list.
   * @param \Drupal\helfi_ahjo\Utils\TaxonomyUtils $taxonomyUtils
   *   Taxonomy utils for tree.
   * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entity_type_manager
   *   The entity type manager service.
   * @param \GuzzleHttp\ClientInterface $guzzleClient
   *   A fully configured Guzzle client to pass to the dam client.
   */
  public function __construct(
    ModuleExtensionList $extension_list_module,
    TaxonomyUtils $taxonomyUtils,
    EntityTypeManagerInterface $entity_type_manager,
    ClientInterface $guzzleClient
  ) {
    $this->moduleExtensionList = $extension_list_module;
    $this->taxonomyUtils = $taxonomyUtils;
    $this->entityTypeManager = $entity_type_manager;
    $this->guzzleClient = $guzzleClient;
  }

  /**
   * {@inheritDoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('extension.list.module'),
      $container->get('helfi_ahjo.taxonomy_utils'),
      $container->get('entity_type.manager'),
      $container->get('http_client')
    );
  }

  /**
   * {@inheritdoc}
   */
  public static function getConfig(): ImmutableConfig {
    return \Drupal::config('helfi_ahjo.config');
  }

  /**
   * {@inheritDoc}
   */
  public function fetchDataFromRemote(): string {
    $config = self::getConfig();
    $url = sprintf("%s/fi/ahjo-proxy/org-chart/00001/9999?api-key=%s", $config->get('base_url'), $config->get('api_key'));

    $response = $this->guzzleClient->request('GET', $url);

    return $response->getBody()->getContents();
  }

  /**
   * Call createTaxonomyTermsTree() and syncTaxonomyTree functions.
   */
  public function insertSyncData() {
    $this->createTaxonomyTermsTree($this->fetchDataFromRemote());
    $this->syncTaxonomyTermsTree();
  }

  /**
   * Create tree in taxonomy.
   *
   * @param array|string $data
   *   Data param.
   * @param array $hierarchy
   *   Hierarchy param.
   * @param string|null $parentId
   *   Parent id param.
   *
   * @return array
   *   Retrun array or mixed value.
   *
   * @throws \Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException
   * @throws \Drupal\Component\Plugin\Exception\PluginNotFoundException
   * @throws \Drupal\Core\Entity\EntityStorageException
   */
  private function createTaxonomyTermsTree($data, array &$hierarchy = [], $parentId = NULL): array {
    if (!is_array($data)) {
      $data = Json::decode($data);
    }

    foreach ($data as $content) {

      $hierarchy[] = [
        'id' => $content['ID'],
        'parent' => $parentId ?? 0,
        'title' => $content['Name'],
      ];

      $loadByExternalId = \Drupal::entityTypeManager()->getStorage('taxonomy_term')->loadByProperties([
        'vid' => 'sote_section',
        'field_external_id' => $content['ID'],
      ]);

      if (count($loadByExternalId) == 0) {
        $term = Term::create([
          'name' => $content['Name'],
          'vid' => 'sote_section',
          'field_external_id' => $content['ID'],
          'field_external_parent_id' => $parentId ?? 0,
          'field_section_type' => $content['Type'],
          'field_section_type_id' => $content['TypeId'],
        ]);
        $term->save();
      }
      if (isset($content['OrganizationLevelBelow'])) {
        $this->createTaxonomyTermsTree($content['OrganizationLevelBelow'], $hierarchy, $content['ID']);
      }
    }

    return $hierarchy;
  }

  /**
   * {@inheritDoc}
   */
  public function addToCron($data, $queue, $parentId = NULL) {
    if (!is_array($data)) {
      $data = Json::decode($data);
    }

    foreach ($data as $section) {
      $section['parentId'] = $parentId ?? 0;
      $queue->createItem($section);

      if (isset($section['OrganizationLevelBelow'])) {
        $this->addToCron($section['OrganizationLevelBelow'], $queue, $section['ID']);
      }
    }
    $this->syncTaxonomyTermsTree();
  }

  /**
   * {@inheritDoc}
   */
  public function syncTaxonomyTermsTree() {
    $terms = $this->entityTypeManager
      ->getStorage('taxonomy_term')
      ->loadByProperties(['vid' => 'sote_section']);
    foreach ($terms as $item) {
      if (!isset($item->field_external_parent_id->value)
        || $item->field_external_parent_id->value == NULL
        || $item->field_external_parent_id->value == '0') {
        continue;
      }
      $loadByExternalId = $this->entityTypeManager->getStorage('taxonomy_term')->loadByProperties([
        'vid' => 'sote_section',
        'field_external_id' => $item->field_external_parent_id->value,
      ]);

      $item->set('parent', reset($loadByExternalId)->tid->value);
      $item->save();

    }
  }

  /**
   * {@inheritDoc}
   */
  public function showDataAsTree() {
    return $this->taxonomyUtils->load('sote_section', TRUE);
  }

}
