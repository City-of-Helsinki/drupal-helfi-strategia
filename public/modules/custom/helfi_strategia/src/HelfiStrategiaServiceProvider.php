<?php

declare(strict_types=1);

namespace Drupal\helfi_strategia;

use Drupal\Core\DependencyInjection\ContainerBuilder;
use Drupal\Core\DependencyInjection\ServiceProviderBase;
use Drupal\helfi_strategia\EventSubscriber\CspElasticProxySubscriber;
use Symfony\Component\DependencyInjection\Reference;

/**
 * A service provider.
 */
final class HelfiStrategiaServiceProvider extends ServiceProviderBase {

  /**
   * {@inheritdoc}
   */
  public function register(ContainerBuilder $container) : void {
    // We cannot use the module handler as the container is not yet compiled.
    // @see \Drupal\Core\DrupalKernel::compileContainer()
    $modules = $container->getParameter('container.modules');

    if (!isset($modules['csp'])) {
      return;
    }

    $container->register(CspElasticProxySubscriber::class, CspElasticProxySubscriber::class)
      ->addTag('event_subscriber')
      ->addArgument(new Reference(ElasticProxyResolver::class))
      ->addArgument(new Reference('config.factory'))
      ->addArgument(new Reference('module_handler'))
      ->addArgument(new Reference('helfi_api_base.environment_resolver'))
      ->addArgument(new Reference('csp.policy_helper'));
  }

}
