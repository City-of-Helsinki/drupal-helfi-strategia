# City of Helsinki - Päätöksenteko ja hallinto Drupal project

The Päätöksenteko ja hallinto site has had many names and might still be referred to as Strategia ja talous or simply
Strategia in some places. This site contains information about decision-making and administration in the city of
Helsinki.

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

### IBM Watson chat
The Päätöksenteko ja hallinto site features the IBM Watson Chatbot on few pages. You can configure the chatbot on the
block layout page (admin/structure/block). More documentation about the chatbot is available in [Confluence](https://helsinkisolutionoffice.atlassian.net/wiki/spaces/HEL/pages/8145469986/IBM+Chat+App+Drupal+integration), and the
code for the Drupal block can be found [here](https://github.com/City-of-Helsinki/drupal-helfi-platform-config/blob/main/src/Plugin/Block/IbmChatApp.php).

### Menu depth override
The maximum menu depth has been set to 6 (the default is 4). This change primarily affects the sidebar menu. The depth
modification has been made in the [hdbt_subtheme.theme](https://github.com/City-of-Helsinki/drupal-helfi-strategia/blob/dev/public/themes/custom/hdbt_subtheme/hdbt_subtheme.theme) file.
The menus support a deeper structure by default, so no additional changes, such as style adjustments, have been
necessary.

### Templates under the hdbt_subtheme
The Päätöksenteko ja hallinto instance includes a few templates for the _Service List Search_ paragraph used on the
site. These files are:
- `form--views-exposed-form-service-list-block-search`
- `input--textfield--service-list-search`
Since the paragraph is globally available, it might be a good idea in the future to move these files to the hdbt theme.
