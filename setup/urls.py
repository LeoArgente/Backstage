from django.urls import path, include
from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from backstage.views import FilmeDetalheAPIView

urlpatterns = [
     path("admin/", admin.site.urls),
     path('', include('backstage.urls')),
     path('filmes/<int:tmdb_id>/detalhes/', FilmeDetalheAPIView.as_view(), name='filme-detalhes'),
 ]

# Servir arquivos de mídia em desenvolvimento
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)