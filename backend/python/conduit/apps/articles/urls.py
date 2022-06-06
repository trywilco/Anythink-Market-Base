from django.urls import include, re_path

from rest_framework.routers import DefaultRouter

from .views import (
    ArticleViewSet, ArticlesFavoriteAPIView, ArticlesFeedAPIView,
    CommentsListCreateAPIView, CommentsDestroyAPIView, TagListAPIView
)

router = DefaultRouter(trailing_slash=False)
router.register(r'articles', ArticleViewSet)

urlpatterns = [
    re_path(r'^', include(router.urls)),

    re_path(r'^articles/feed/?$', ArticlesFeedAPIView.as_view()),

    re_path(r'^articles/(?P<article_slug>[-\w]+)/favorite/?$',
        ArticlesFavoriteAPIView.as_view()),

    re_path(r'^articles/(?P<article_slug>[-\w]+)/comments/?$', 
        CommentsListCreateAPIView.as_view()),

    re_path(r'^articles/(?P<article_slug>[-\w]+)/comments/(?P<comment_pk>[\d]+)/?$',
        CommentsDestroyAPIView.as_view()),

    re_path(r'^tags/?$', TagListAPIView.as_view()),
]
