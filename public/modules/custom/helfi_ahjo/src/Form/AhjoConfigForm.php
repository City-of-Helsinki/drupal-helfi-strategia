<?php

namespace Drupal\helfi_ahjo\Form;

use Drupal\Component\Utility\Xss;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;
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
   * Constructor.
   *
   * @param \Drupal\Core\Config\ConfigFactoryInterface $config_factory
   *   The factory for configuration objects.
   * @param \Drupal\helfi_ahjo\Services\AhjoService $ahjoService
   *   Services for Ahjo API.
   */
  public function __construct(ConfigFactoryInterface $config_factory, AhjoService $ahjoService) {
    parent::__construct($config_factory);
    $this->ahjoService = $ahjoService;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('config.factory'),
      $container->get('helfi_ahjo.ahjo_service')
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

    $form['actions']['#type'] = 'actions';
    $form['actions']['submit'] = [
      '#type' => 'submit',
      '#value' => $this->t('Save Ahjo Configuration and Import Data'),
      '#button_type' => 'primary',
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

  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state): void {
    $this->config('helfi_ahjo.config')
      ->set('base_url', $form_state->getValue('helfi_ahjo_base_url'))
      ->set('api_key', $form_state->getValue('helfi_ahjo_api_key'))
      ->save();

    $this->ahjoService->insertSyncData();
  }

}
