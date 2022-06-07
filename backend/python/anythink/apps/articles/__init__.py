from django.apps import AppConfig


class ArticlesAppConfig(AppConfig):
    name = 'anythink.apps.articles'
    label = 'articles'
    verbose_name = 'Articles'

    def ready(self):
        import anythink.apps.articles.signals

default_app_config = 'anythink.apps.articles.ArticlesAppConfig'
