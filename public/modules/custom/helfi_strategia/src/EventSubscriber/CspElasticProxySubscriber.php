<?php

declare(strict_types=1);

namespace Drupal\helfi_strategia\EventSubscriber;

use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Extension\ModuleHandlerInterface;
use Drupal\csp\Event\PolicyAlterEvent;
use Drupal\csp\PolicyHelper;
use Drupal\helfi_api_base\Environment\EnvironmentResolverInterface;
use Drupal\helfi_platform_config\EventSubscriber\CspSubscriberBase;
use Drupal\helfi_strategia\ElasticProxyResolver;

/**
 * Adds Elastic Proxy URL to CSP.
 *
 * @package Drupal\helfi_strategia\EventSubscriber
 */
class CspElasticProxySubscriber extends CspSubscriberBase {

  public function __construct(
    private readonly ElasticProxyResolver $elasticProxyResolver,
    ConfigFactoryInterface $configFactory,
    ModuleHandlerInterface $moduleHandler,
    EnvironmentResolverInterface $environmentResolver,
    PolicyHelper $policyHelper,
  ) {
    parent::__construct($configFactory, $moduleHandler, $environmentResolver, $policyHelper);
  }

  /**
   * Alter CSP policy to allow etusivu Elastic Proxy URL.
   *
   * @param \Drupal\csp\Event\PolicyAlterEvent $event
   *   The policy alter event.
   */
  public function policyAlter(PolicyAlterEvent $event): void {
    $policy = $event->getPolicy();
    $proxy_url = $this->elasticProxyResolver->getElasticProxyUrl();
    $policy->fallbackAwareAppendIfEnabled('connect-src', [$proxy_url]);
  }

}
