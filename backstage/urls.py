from django.urls import path
from django.views.generic import RedirectView
from . import views

app_name = 'backstage'

urlpatterns = [
    path('', RedirectView.as_view(pattern_name='backstage:login', permanent=False)),
    
    path('login/', views.pagina_login, name='login'),
    path('home/', views.home, name='home'),
    path("community/", views.community, name="community"),
    path("filmes/", views.filmes, name="filmes"),
    path("movies/", views.movies, name="movies"),
    path("lists/", views.lists, name="lists"),
    path("noticias/", views.noticias, name="noticias"),
    path("series/", views.series, name="series"),
    path("wireframer/", views.wireframer, name="wireframer"),
    path('sair/', views.sair, name='sair'),
    path('registrar/', views.registrar, name='registrar'),
    path('filme/<int:filme_id>/criticar/', views.adicionar_critica, name="adicionar_critica"),
    path('filmes/<int:filme_id>/', views.detalhes_filme, name='detalhes_filme'),
]
