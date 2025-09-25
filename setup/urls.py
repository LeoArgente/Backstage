"""
URL configuration for setup project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.urls import path, include
from django.contrib import admin
from backstage.views import FilmeDetalheAPIView, index, community, filmes, lists, movies, noticias, series, wireframer
from rest_framework.routers import DefaultRouter

#Primeira definição de urlpatterns (comentada pois a segunda já inclui backstage.urls)
urlpatterns = [
     path("admin/", admin.site.urls),
     path("community/", community, name="community"),
     path("filmes/", filmes, name="filmes"),
     path("movies/", movies, name="movies"),
     path("lists/", lists, name="lists"),
     path("noticias/", noticias, name="noticias"),
     path("series/", series, name="series"),
     path("wireframer/", wireframer, name="wireframer"),
     path('', include('backstage.urls')),
     path('filmes/<int:tmdb_id>/detalhes/', FilmeDetalheAPIView.as_view(), name='filme-detalhes'),
 ]

# backend lou e leo #################################################