from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .api_views import FilmeDetalheAPIView

urlpatterns = [
    path('filmes/<int:tmdb_id>/detalhes/', FilmeDetalheAPIView.as_view(), name='filme-detalhes'),
]
