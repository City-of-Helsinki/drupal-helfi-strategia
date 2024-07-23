# City of Helsinki - Strategia Drupal 9 project

Päätöksenteko ja hallinto (former Strategia ja talous) contains information about decisionmaking

## Environments

Env | Branch | Drush alias | URL
--- | ------ | ----------- | ---
development | * | - | http://strategia.docker.so/
production | main | @main | https://hel.fi/fi/paatoksenteko-ja-hallinto

## Requirements

You need to have these applications installed to operate on all environments:

- [Docker](https://github.com/druidfi/guidelines/blob/master/docs/docker.md)
- [Stonehenge](https://github.com/druidfi/stonehenge)
- For the new person: Your SSH public key needs to be added to servers

## Create and start the environment

For the first time (new project):

``
$ make new
``

And following times to start the environment:

``
$ make up
``

NOTE: Change these according of the state of your project.

## Login to Drupal container

This will log you inside the app container:

```
$ make shell
```

## Instance specific features

The site has a minimal amount of instance specific features

### Menu depth override

Menu depth has been set to 6 (default is 4). Menu depth affects mainly the sidebar menu

### Form template changes

Minimal template changes on few template files
- form--views-exposed-form-service-list-block-search
- input--textfield--service-list-search
