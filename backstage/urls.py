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
    path('noticias/', views.noticias, name='noticias'),
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
    path('api/filmes/', views.filmes_api, name='filmes_api'),
    path('api/filme/<int:tmdb_id>/videos/', views.filme_videos, name='filme_videos'),
    path('api/criar-lista/', views.criar_lista, name='criar_lista'),
    path('api/buscar-listas/', views.buscar_listas_usuario, name='buscar_listas_usuario'),
    path('api/watch-later/', views.buscar_ou_criar_lista_watch_later, name='watch_later'),
    path('api/watch-later/verificar/<int:tmdb_id>/', views.verificar_filme_watch_later, name='verificar_filme_watch_later'),
    path('api/watch-later/verificar-serie/<int:tmdb_id>/', views.verificar_serie_watch_later, name='verificar_serie_watch_later'),
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
    path('convite/<str:codigo>/', views.entrar_por_convite, name='entrar_por_convite'),
    
    # APIs para comunidades
    path('criar-comunidade/', views.criar_comunidade, name='criar_comunidade'),
    path('entrar-comunidade/', views.entrar_comunidade, name='entrar_comunidade'),
    path('sair-comunidade/', views.sair_comunidade, name='sair_comunidade'),
    path('deletar-comunidade/', views.deletar_comunidade, name='deletar_comunidade'),
    path('convidar-amigo/', views.convidar_amigo, name='convidar_amigo'),
    
    # API de busca de filmes (DEVE VIR ANTES das URLs com <slug>)
    path('comunidade/buscar-filmes/', views.buscar_filmes_para_recomendar, name='buscar_filmes_para_recomendar'),
    
    # URLs de comunidade específica
    path('comunidade/<slug:slug>/', views.detalhes_comunidade, name='detalhes_comunidade'),
    
    # APIs de Chat da Comunidade
    path('comunidade/<slug:slug>/enviar-mensagem/', views.enviar_mensagem_comunidade, name='enviar_mensagem_comunidade'),
    path('comunidade/<slug:slug>/buscar-mensagens/', views.buscar_mensagens_comunidade, name='buscar_mensagens_comunidade'),
    path('comunidade/<slug:slug>/recomendar-filme/', views.recomendar_filme_comunidade, name='recomendar_filme_comunidade'),
    
    # URLs do menu do usuário
    path('perfil/', views.perfil, name='perfil'),
    path('perfil/<str:username>/', views.perfil, name='perfil_usuario'),
    path('meu-diario/', views.meu_diario, name='meu_diario'),
    path('reviews/', views.reviews, name='reviews'),
    path('reviews/<str:username>/', views.reviews, name='reviews_usuario'),
    path('watchlist/', views.watchlist, name='watchlist'),
    path('lista/<int:lista_id>/', views.lista_detalhes, name='lista_detalhes'),
    path('favoritos/', views.favoritos, name='favoritos'),
    path('configuracoes/', views.configuracoes, name='configuracoes'),
    path('ajuda/', views.ajuda, name='ajuda'),
    path('amigos/', views.amigos, name='amigos'),

    # URLs de Diário
    path('diary/', views.diary, name='diary'),
    path('api/diario/entradas/', views.diario_entradas, name='diario_entradas'),
    path('api/diario/adicionar/', views.diario_adicionar, name='diario_adicionar'),
    path('api/diario/remover/<int:entrada_id>/', views.diario_remover, name='diario_remover'),
    
    # URLs de Sistema de Amizade
    path('api/buscar-usuarios-realtime/', views.buscar_usuarios_realtime, name='buscar_usuarios_realtime'),
    path('api/enviar-solicitacao/', views.enviar_solicitacao, name='enviar_solicitacao'),
    path('api/aceitar-solicitacao/', views.aceitar_solicitacao, name='aceitar_solicitacao'),
    path('api/rejeitar-solicitacao/', views.rejeitar_solicitacao, name='rejeitar_solicitacao'),
    path('api/cancelar-solicitacao/', views.cancelar_solicitacao, name='cancelar_solicitacao'),
    path('api/remover-amigo/', views.remover_amigo, name='remover_amigo'),
    
    # URLs de Notificações
    path('api/notificacoes/', views.buscar_notificacoes, name='buscar_notificacoes'),

    # URLs de Likes
    path('api/critica/<int:critica_id>/like/', views.toggle_like_critica, name='toggle_like_critica'),
    path('api/critica-serie/<int:critica_id>/like/', views.toggle_like_critica_serie, name='toggle_like_critica_serie'),
]
