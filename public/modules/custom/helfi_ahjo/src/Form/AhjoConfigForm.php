<?php

namespace Drupal\helfi_ahjo\Form;

use Drupal\Component\Utility\Xss;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Logger\LoggerChannelFactoryInterface;
use Drupal\Core\Messenger\MessengerInterface;
use Drupal\helfi_ahjo\Services\AhjoService;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Gredi DAM module configuration form.
 */
class AhjoConfigForm extends ConfigFormBase {

  /**
   * The entity type manager.
   *
   * @var \Drupal\helfi_ahjo\Services\AhjoService
   */
  protected $ahjoService;

  /**
   * Messenger service.
   *
   * @var \Drupal\Core\Messenger\MessengerInterface
   */
  protected $messenger;

  /**
   * Logger factory service.
   *
   * @var \Drupal\Core\Logger\LoggerChannelFactoryInterface
   */
  protected $loggerFactory;

  /**
   * Constructor.
   *
   * @param \Drupal\Core\Config\ConfigFactoryInterface $config_factory
   *   The factory for configuration objects.
   * @param \Drupal\helfi_ahjo\Services\AhjoService $ahjoService
   *   Services for Ahjo API.
   * @param \Drupal\Core\Messenger\MessengerInterface $messenger
   *   Service for messenger.
   * @param \Drupal\Core\Logger\LoggerChannelFactoryInterface $loggerFactory
   *   Service for logger factory.
   */
  public function __construct(
    ConfigFactoryInterface $config_factory,
    AhjoService $ahjoService,
    MessengerInterface $messenger,
    LoggerChannelFactoryInterface $loggerFactory) {
    parent::__construct($config_factory);
    $this->ahjoService = $ahjoService;
    $this->messenger = $messenger;
    $this->loggerFactory = $loggerFactory;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('config.factory'),
      $container->get('helfi_ahjo.ahjo_service'),
      $container->get('messenger'),
      $container->get('logger.factory')
    );
  }

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames() {
    return [
      'helfi_ahjo.config',
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'gredi_ahjo_config';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state): array {
    $config = $this->config('helfi_ahjo.config');

    $form['helfi_ahjo_base_url'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Ahjo Base URL'),
      '#default_value' => $config->get('base_url'),
      '#description' => $this->t('example: demo.ahjo.fi'),
      '#required' => TRUE,
    ];

    $form['helfi_ahjo_api_key'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Ahjo API Key'),
      '#default_value' => $config->get('api_key'),
      '#description' => $this->t('apikey'),
      '#required' => TRUE,
    ];

    $form['organigram_max_depth'] = [
      '#type' => 'number',
      '#title' => $this->t('Organigram Max Depth'),
      '#default_value' => $config->get('organigram_max_depth'),
      '#description' => $this->t('Default: 3'),
      '#required' => TRUE,
    ];

    $form['actions']['#type'] = 'actions';
    $form['actions']['submit'] = [
      '#type' => 'submit',
      '#value' => $this->t('Save Ahjo Configuration'),
      '#button_type' => 'primary',
    ];
    $form['actions']['import_sync'] = [
      '#type' => 'submit',
      '#value' => $this->t('Import Data and Sync'),
      '#button_type' => 'primary',
      '#submit' => ['::importSyncData'],
    ];

    return $form;
  }

  /**
   * Validate that the provided values are valid or nor.
   *
   * @param array $form
   *   Form array.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   Form state instance.
   */
  public function validateForm(array &$form, FormStateInterface $form_state): void {
    $base_url = Xss::filter($form_state->getValue('helfi_ahjo_base_url'));
    if (!$base_url) {
      $form_state->setErrorByName(
        'helfi_ahjo_base_url',
        $this->t('Provided base url is not valid.')
      );
      return;
    }

    $api_key = Xss::filter($form_state->getValue('helfi_ahjo_api_key'));
    if (!$api_key) {
      $form_state->setErrorByName(
        'helfi_ahjo_api_key',
        $this->t('Provided api key is not valid.')
      );
    }

    $organigram_max_depth = Xss::filter($form_state->getValue('organigram_max_depth'));
    if (!$organigram_max_depth || is_int($organigram_max_depth)) {
      $form_state->setErrorByName(
        'organigram_max_depth',
        $this->t('Provided max depth is not valid.')
      );
    }

  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state): void {
    $this->config('helfi_ahjo.config')
      ->set('base_url', $form_state->getValue('helfi_ahjo_base_url'))
      ->set('api_key', $form_state->getValue('helfi_ahjo_api_key'))
      ->set('organigram_max_depth', $form_state->getValue('organigram_max_depth'))
      ->save();
    $this->messenger->addStatus('Settings are updated!');

  }

  /**
   * Import data and sync it.
   */
  public function importSyncData(array &$form, FormStateInterface $form_state) {
    $this->ahjoService->insertSyncData();
    $this->messenger->addStatus('Sections imported! and synchronized!');
  }

}
