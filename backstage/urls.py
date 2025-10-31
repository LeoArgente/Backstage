from django.urls import path
from django.views.generic import RedirectView
from . import views
app_name = 'backstage'

urlpatterns = [
    path('', views.index, name='index'),
    #path('login/', RedirectView.as_view(pattern_name='backstage:login', permanent=False)),
    path('login/', views.pagina_login, name='login'),
    path('comunidade/', views.comunidade, name='comunidade'),
    path('filmes/', views.filmes, name='filmes'),
    path('movies/', views.movies, name='movies'),
    path('lists/', views.lists, name='lists'),
    path('series/', views.series, name='series'),
    path('wireframer/', views.wireframer, name='wireframer'),
    path('sair/', views.sair, name='sair'),
    path('registrar/', views.registrar, name='registrar'),
    path('api/registrar/', views.registrar, name='registrar'),
    path('salvar-critica/', views.salvar_critica, name='salvar_critica'),
    path('filmes/<int:tmdb_id>/', views.detalhes_filme, name='detalhes_filme'),
    path('buscar/', views.buscar, name='buscar'),########################################################
    path('api/busca/', views.busca_ajax, name='busca_ajax'),
    path("pesquisar/", views.barra_buscar, name="barra_buscar"),
    path("filmes/<int:tmdb_id>/relatorio/", views.relatorio, name="relatorio"),
    path('api/filmes-home/', views.filmes_home, name='filmes_home'),
    path('api/criar-lista/', views.criar_lista, name='criar_lista'),
    path('api/buscar-listas/', views.buscar_listas_usuario, name='buscar_listas_usuario'),
    path('api/watch-later/', views.buscar_ou_criar_lista_watch_later, name='watch_later'),
    path('api/lista/<int:lista_id>/', views.editar_lista, name='editar_lista'),
    path('api/lista/<int:lista_id>/deletar/', views.deletar_lista, name='deletar_lista'),
    path('api/lista/<int:lista_id>/visualizar/', views.visualizar_lista, name='visualizar_lista'),
    path('api/lista/<int:lista_id>/adicionar/<int:tmdb_id>/', views.adicionar_filme_lista, name='adicionar_filme_lista'),
    path('api/lista/<int:lista_id>/remover/<int:tmdb_id>/', views.remover_filme_da_lista, name='remover_filme_lista'),
    path('api/lista/<int:lista_id>/remover-item/', views.remover_item_lista, name='remover_item_lista'),
    path('series/<int:tmdb_id>/', views.detalhes_serie, name='detalhes_serie'),
    path('salvar-critica-serie/', views.salvar_critica_serie, name='salvar_critica_serie'),
    path('api/series/<int:tmdb_id>/temporada/<int:numero_temporada>/', views.buscar_temporada_api, name='buscar_temporada'),
    path('api/lista/<int:lista_id>/adicionar-serie/<int:tmdb_id>/', views.adicionar_serie_lista, name='adicionar_serie_lista'),
    path('api/lista/<int:lista_id>/remover-serie/<int:tmdb_id>/', views.remover_serie_da_lista, name='remover_serie_lista'),
    
    # API de sugestões de busca
    path('api/sugestoes/', views.buscar_sugestoes, name='buscar_sugestoes'),
    
    # URLs para comunidades
    path('minhas-comunidades/', views.minhas_comunidades, name='minhas_comunidades'),
    path('comunidade/<slug:slug>/', views.detalhes_comunidade, name='detalhes_comunidade'),
    path('convite/<str:codigo>/', views.entrar_por_convite, name='entrar_por_convite'),
    
    # APIs para comunidades
    path('criar-comunidade/', views.criar_comunidade, name='criar_comunidade'),
    path('entrar-comunidade/', views.entrar_comunidade, name='entrar_comunidade'),
    path('sair-comunidade/', views.sair_comunidade, name='sair_comunidade'),
    path('convidar-amigo/', views.convidar_amigo, name='convidar_amigo'),
    
    # URLs de Amizade
    path('amigos/', views.amigos, name='amigos'),
    
    # APIs de Amizade
    path('api/buscar-usuarios/', views.buscar_usuarios, name='buscar_usuarios'),
    path('api/enviar-solicitacao-amizade/', views.enviar_solicitacao_amizade, name='enviar_solicitacao_amizade'),
    path('api/aceitar-solicitacao-amizade/<int:request_id>/', views.aceitar_solicitacao_amizade, name='aceitar_solicitacao_amizade'),
    path('api/aceitar-solicitacao-por-usuario/<int:user_id>/', views.aceitar_solicitacao_por_usuario, name='aceitar_solicitacao_por_usuario'),
    path('api/rejeitar-solicitacao-amizade/<int:request_id>/', views.rejeitar_solicitacao_amizade, name='rejeitar_solicitacao_amizade'),
    path('api/cancelar-solicitacao-amizade/<int:request_id>/', views.cancelar_solicitacao_amizade, name='cancelar_solicitacao_amizade'),
    path('api/remover-amigo/<int:user_id>/', views.remover_amigo, name='remover_amigo'),
]
