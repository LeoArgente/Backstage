from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import UserCreationForm
from django.conf import settings

def index(request):
    from backstage.services.tmdb import buscar_filme_destaque

    try:
        filme_destaque = buscar_filme_destaque()
    except:
        filme_destaque = None

    context = {
        'filme_destaque': filme_destaque,
        'tmdb_image_base': settings.TMDB_IMAGE_BASE_URL
    }

    return render(request, "backstage/index.html", context)

# backend lou e leo #################################################################
def pagina_login(request):
    if request.method == "POST":
        username = request.POST.get('username', '')
        senha = request.POST.get('password', '')
        user = authenticate(request, username=username, password=senha)
        if user is not None:
            login(request, user)
            return redirect('backstage:home')  # usa namespace do app
        return render(request, 'backstage/login.html', {'erro': 'Usuário ou senha inválidos'})
    return render(request, 'backstage/login.html')

@login_required(login_url='backstage:login')
def home(request):
    from backstage.services.tmdb import buscar_filme_destaque

    try:
        filme_destaque = buscar_filme_destaque()
    except:
        filme_destaque = None

    context = {
        'filme_destaque': filme_destaque,
        'tmdb_image_base': settings.TMDB_IMAGE_BASE_URL
    }

    return render(request, 'backstage/index.html', context)

def sair(request):
    logout(request)
    return redirect('backstage:login')

# login/home/sair

def registrar(request):
    if request.user.is_authenticated:
        return redirect('backstage:home')

    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            usuario = form.save()
            login(request, usuario)
            return redirect('backstage:home')
    else:
        form = UserCreationForm()

    return render(request, 'backstage/register.html', {'form': form})

# chamadas das urls das páginas #################################################################################################
# front nononha e liz + back leo e lou

def community(request):
    return render(request, "backstage/community.html")

def filmes(request):
    return render(request, "backstage/filmes.html")

def lists(request):
    return render(request, "backstage/lists.html")

def movies(request):
    from backstage.services.tmdb import buscar_filmes_populares
    try:
        filmes = buscar_filmes_populares()
    except:
        filmes = []

    context = {
        'filmes': filmes,
        'tmdb_image_base': settings.TMDB_IMAGE_BASE_URL
    }
    return render(request, "backstage/movies.html", context)

def noticias(request):
    return render(request, "backstage/noticias.html")

def series(request):
    from backstage.services.tmdb import buscar_series_populares
    try:
        series_list = buscar_series_populares()
    except:
        series_list = []

    context = {
        'series': series_list,
        'tmdb_image_base': settings.TMDB_IMAGE_BASE_URL
    }
    return render(request, "backstage/series.html", context)

def wireframer(request):
    return render(request, "backstage/wireframer.html")

# back vitor e henrique ###########################################################################
from .models import Filme, Critica

@login_required
def adicionar_critica(request, tmdb_id):
    from backstage.services.tmdb import obter_detalhes_com_cache

    notas = [5.0, 4.5, 4.0, 3.5, 3.0, 2.5, 2.0, 1.5, 1.0, 0.5]

    #Busca dados do filme da API
    try:
        dados_filme = obter_detalhes_com_cache(tmdb_id)
    except:
        return render(request, '404.html', {'erro': 'Filme não encontrado'})

    # Garante que filme existe localmente
    filme_local, _ = Filme.objects.get_or_create(
        tmdb_id=tmdb_id,
        defaults={
            'titulo': dados_filme.get('titulo', ''),
            'descricao': dados_filme.get('sinopse', ''),})

    if request.method == "POST":
        texto = request.POST.get('texto')
        nota = request.POST.get('nota')

        if texto and nota:
            Critica.objects.create(
                filme=filme_local,
                usuario=request.user,
                texto=texto,
                nota=float(nota))
            return redirect('backstage:detalhes_filme', tmdb_id=tmdb_id)
        else:
            erro = "Todos os campos são obrigatórios."
            return render(request, 'backstage/adicionar_critica.html', {
                'filme': dados_filme,
                'erro': erro,
                'notas': notas,
                'tmdb_image_base': settings.TMDB_IMAGE_BASE_URL})

    return render(request, 'backstage/adicionar_critica.html', {
        'filme': dados_filme,
        'notas': notas,
        'tmdb_image_base': settings.TMDB_IMAGE_BASE_URL})

def detalhes_filme(request, tmdb_id):
    from backstage.services.tmdb import obter_detalhes_com_cache

    try:
        dados_filme = obter_detalhes_com_cache(tmdb_id)
    except:
        return render(request, '404.html', {'erro': 'Filme não encontrado'})

    # Criar ou buscar filme local para críticas
    filme_local, created = Filme.objects.get_or_create(
        tmdb_id=tmdb_id,
        defaults={
            'titulo': dados_filme.get('titulo', ''),
            'descricao': dados_filme.get('sinopse', ''),
        })

    # Buscar críticas locais
    criticas = Critica.objects.filter(filme=filme_local)
    context = {
        'filme': dados_filme,
        'filme_local': filme_local,
        'criticas': criticas,
        'tmdb_image_base': settings.TMDB_IMAGE_BASE_URL
        }
    return render(request, "backstage/filmes.html", context)

def buscar(request):
    from backstage.services.tmdb import buscar_filme_por_titulo

    query = request.GET.get('q', '')
    resultados = []

    if query:
        try:
            resultados = buscar_filme_por_titulo(query)
        except:
            resultados = []

    context = {
        'query': query,
        'resultados': resultados,
        'tmdb_image_base': settings.TMDB_IMAGE_BASE_URL
    }
    return render(request, "backstage/busca.html", context)

# back lou e leo ###################################################
# dados da API
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from .services.tmdb import obter_detalhes_com_cache, montar_payload_agregado

class FilmeDetalheAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, tmdb_id: int):
        region = request.query_params.get("region") or getattr(settings, "TMDB_DEFAULT_REGION", "BR")
        usar_cache = request.query_params.get("cache", "1") != "0"

        try:
            if usar_cache:
                payload = obter_detalhes_com_cache(tmdb_id, ttl_minutos=1440, region=region)
            else:
                payload = montar_payload_agregado(tmdb_id, region=region)
            return Response(payload, status=status.HTTP_200_OK)
        except Exception as e:
            # você pode logar 'e' com sentry/logging
            return Response({"detalhe": "Falha ao consultar a TMDb."}, status=status.HTTP_502_BAD_GATEWAY)
