from django.urls import path
from django.views.generic import RedirectView
from . import views

app_name = 'backstage'

urlpatterns = [
    path('', RedirectView.as_view(pattern_name='backstage:login', permanent=False)),
    
    path('login/', views.pagina_login, name='login'),
    path('home/', views.home, name='home'),
    path('sair/', views.sair, name='sair'),
    path('registrar/', views.registrar, name='registrar'),
    path('filme/<int:filme_id>/criticar/', views.adicionar_critica, name="adicionar_critica"),
    path('filmes/<int:filme_id>/', views.detalhes_filme, name='detalhes_filme'),
]
