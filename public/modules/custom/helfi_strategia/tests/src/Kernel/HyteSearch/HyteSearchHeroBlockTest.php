<?php

declare(strict_types=1);

namespace Drupal\Tests\helfi_strategia\Kernel\HyteSearch;

use Drupal\helfi_strategia\Plugin\Block\HyteSearchHeroBlock;
use Drupal\Tests\helfi_strategia\Kernel\KernelTestBase;
use PHPUnit\Framework\Attributes\Group;
use PHPUnit\Framework\Attributes\RunTestsInSeparateProcesses;
use Symfony\Component\DependencyInjection\Loader\Configurator\Traits\PropertyTrait;

/**
 * Kernel tests for HyteSearchHeroBlock.
 */
#[Group('helfi_strategia')]
#[RunTestsInSeparateProcesses]
class HyteSearchHeroBlockTest extends KernelTestBase {

  use PropertyTrait;

  /**
   * {@inheritdoc}
   */
  protected static $modules = [
    'block',
  ];

  /**
   * {@inheritdoc}
   */
  protected function setUp(): void {
    parent::setUp();
  }

  /**
   * Tests the build() method of the hero block.
   */
  public function testBuildMethod(): void {
    $plugin_definition = ['provider' => 'helfi_strategia'];

    $block = HyteSearchHeroBlock::create($this->container, [], 'hyte_search_hero_block', $plugin_definition);

    $build = $block->build();

    $this->assertIsArray($build);
    $this->assertArrayHasKey('hyte_search_hero_block', $build);

    $content = $build['hyte_search_hero_block'];
    $this->assertArrayHasKey('#theme', $content);
    $this->assertEquals('hyte_search_hero_block', $content['#theme']);
    $this->assertEquals('Find wellbeing services', (string) $content['#hero_title']);
  }

}
