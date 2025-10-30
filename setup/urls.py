from django.urls import path, include
from django.contrib import admin
from backstage.views import FilmeDetalheAPIView

urlpatterns = [
     path("admin/", admin.site.urls),
     path('', include('backstage.urls')),
     path('filmes/<int:tmdb_id>/detalhes/', FilmeDetalheAPIView.as_view(), name='filme-detalhes'),
 ]