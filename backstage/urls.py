from django.urls import path
from django.views.generic import RedirectView
from . import views

app_name = 'backstage'

urlpatterns = [
    path('', views.index, name='index'),
    #path('login/', RedirectView.as_view(pattern_name='backstage:login', permanent=False)),
<<<<<<< HEAD
    #path('login/', views.pagina_login, name='login'),
=======
    path('login/', views.pagina_login, name='login'),
>>>>>>> 6718ae52ded3bfd37bd2b662da4b7dc3f1b8d2b9
    path('comunidade/', views.comunidade, name='comunidade'),
    path('filmes/', views.filmes, name='filmes'),
    path('movies/', views.movies, name='movies'),
    path('lists/', views.lists, name='lists'),
    path('noticias/', views.noticias, name='noticias'),
    path('series/', views.series, name='series'),
    path('wireframer/', views.wireframer, name='wireframer'),
    path('sair/', views.sair, name='sair'),
    path('registrar/', views.registrar, name='registrar'),
    path('filme/<int:tmdb_id>/criticar/', views.adicionar_critica, name='adicionar_critica'),
    path('salvar-critica/', views.salvar_critica, name='salvar_critica'),
    path('filmes/<int:tmdb_id>/', views.detalhes_filme, name='detalhes_filme'),
    path('buscar/', views.buscar, name='buscar'),
<<<<<<< HEAD
    path("filmes/<int:tmdb_id>/relatorio/", views.relatorio, name="relatorio"),

=======
    path('api/criar-lista/', views.criar_lista, name='criar_lista'),
    path('api/buscar-listas/', views.buscar_listas_usuario, name='buscar_listas_usuario'),
    path('api/lista/<int:lista_id>/adicionar/<int:tmdb_id>/', views.adicionar_filme_lista, name='adicionar_filme_lista'),
>>>>>>> 6718ae52ded3bfd37bd2b662da4b7dc3f1b8d2b9
]
