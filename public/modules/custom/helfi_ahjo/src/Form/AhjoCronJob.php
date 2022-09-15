<?php

namespace Drupal\helfi_ahjo\Form;

use Drupal\Component\Datetime\TimeInterface;
use Drupal\Component\Serialization\Json;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Cron;
use Drupal\Core\CronInterface;
use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Logger\LoggerChannelFactoryInterface;
use Drupal\Core\Messenger\MessengerInterface;
use Drupal\Core\Queue\QueueFactory;
use Drupal\Core\State\StateInterface;
use Drupal\helfi_ahjo\Services\AhjoService;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Gredi DAM module configuration form.
 */
class AhjoCronJob extends ConfigFormBase {

  /**
   * The entity type manager.
   *
   * @var \Drupal\helfi_ahjo\Services\AhjoService
   */
  protected $ahjoService;

  /**
   * Queue service.
   *
   * @var \Drupal\Core\Queue\QueueFactory
   */
  protected $queue;

  /**
   * Cron service.
   *
   * @var \Drupal\Core\CronInterface
   */
  protected $cron;

  /**
   * Logger factory service.
   *
   * @var \Drupal\Core\Logger\LoggerChannelFactoryInterface
   */
  protected $loggerFactory;

  /**
   * State service.
   *
   * @var \Drupal\Core\State\StateInterface
   */
  protected $state;

  /**
   * Date time service.
   *
   * @var \Drupal\Component\Datetime\TimeInterface
   */
  protected $time;

  /**
   * Messenger service.
   *
   * @var \Drupal\Core\Messenger\MessengerInterface
   */
  protected $messenger;

  /**
   * Constructor.
   *
   * @param \Drupal\Core\Config\ConfigFactoryInterface $config_factory
   *   The factory for configuration objects.
   * @param \Drupal\helfi_ahjo\Services\AhjoService $ahjoService
   *   Services for Ahjo API.
   * @param \Drupal\Core\Queue\QueueFactory $queue
   *   Service for queue.
   * @param \Drupal\Core\CronInterface $cron
   *   Service for cron.
   * @param \Drupal\Core\Logger\LoggerChannelFactoryInterface $loggerFactory
   *   Service for logger factory.
   * @param \Drupal\Core\State\StateInterface $state
   *   Service for state.
   * @param \Drupal\Component\Datetime\TimeInterface $time
   *   Service for time.
   * @param \Drupal\Core\Messenger\MessengerInterface $messenger
   *   Service for messenger.
   */
  public function __construct(
    ConfigFactoryInterface $config_factory,
    AhjoService $ahjoService,
    QueueFactory $queue,
    CronInterface $cron,
    LoggerChannelFactoryInterface $loggerFactory,
    StateInterface $state,
    TimeInterface $time,
    MessengerInterface $messenger) {
    parent::__construct($config_factory);
    $this->ahjoService = $ahjoService;
    $this->queue = $queue;
    $this->cron = $cron;
    $this->loggerFactory = $loggerFactory;
    $this->state = $state;
    $this->time = $time;
    $this->messenger = $messenger;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('config.factory'),
      $container->get('helfi_ahjo.ahjo_service'),
      $container->get('queue'),
      $container->get('cron'),
      $container->get('logger.factory'),
      $container->get('state'),
      $container->get('datetime.time'),
      $container->get('messenger')
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
    return 'gredi_ahjo_cron_job';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state): array {
    $config = $this->config('helfi_ahjo.config');
    $form['sync_interval'] = [
      '#type' => 'select',
      '#title' => $this->t('Ahjo Sections Update Interval'),
      '#options' => [
        '-1' => $this->t('Every cron run'),
        '3600' => $this->t('Every hour'),
        '7200' => $this->t('Every 2 hours'),
        '10800' => $this->t('Every 3 hours'),
        '14400' => $this->t('Every 4 hours'),
        '21600' => $this->t('Every 6 hours'),
        '28800' => $this->t('Every 8 hours'),
        '43200' => $this->t('Every 12 hours'),
        '86400' => $this->t('Every 24 hours'),
      ],
      '#default_value' => empty($config->get('sync_interval')) ? 86400 : $config->get('sync_interval'),
      '#description' => $this->t('How often should Ahjo Sections be synced with AhjoProxy?'),
      '#required' => TRUE,
    ];

    $form['actions']['#type'] = 'actions';
    $form['actions']['submit'] = [
      '#type' => 'submit',
      '#value' => $this->t('Save Cron Settings'),
      '#button_type' => 'primary',
    ];
    $form['actions']['run_cron'] = [
      '#type' => 'submit',
      '#value' => $this->t('Run Cron Job Now'),
      '#button_type' => 'primary',
      '#submit' => ['::runCronNow'],
    ];
    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state): void {
    $this->messenger->addStatus('Ahjo Cron Settings saved!');
    $this->config('helfi_ahjo.config')
      ->set('sync_interval', $form_state->getValue('sync_interval'))
      ->save();
  }

  /**
   * Run cron.
   *
   * @param array $form
   *   An associative array containing the structure of the form.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   The current state of the form.
   */
  public function runCronNow(array &$form, FormStateInterface $form_state): void {
    $jsonFile = Json::decode(\Drupal::service('helfi_ahjo.ahjo_service')->fetchDataFromRemote());

    $queue = $this->queue->get('sote_section_update');
    $queue->createQueue();
    $this->ahjoService->addToCron($jsonFile, $queue);

    $request_time = $this->time->getRequestTime();
    $count = $queue->numberOfItems();
    $cron = $this->cron;
    $logger = $this->loggerFactory->get('helfi_ahjo');

    $logger->info('Total items in the queue: @count.', ['@count' => $count]);
    $this->state->set('helfi_ahjo.last_run', $request_time);
    $cron->run();

    $this->ahjoService->syncTaxonomyTermsTree();

    $this->messenger->addStatus('Cron job runned successfuly!');
  }

}
