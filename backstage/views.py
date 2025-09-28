from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login, logout
from .models import Filme, Critica
from django.shortcuts import get_object_or_404, redirect
from django.contrib import messages
from django.contrib.auth.decorators import login_required
import json
from django.http import JsonResponse


@login_required(login_url='backstage:login')
def salvar_critica(request):
    if not request.user.is_authenticated:
        messages.error(request, 'Faça login para enviar uma avaliação.')
        return redirect('backstage:login')
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import UserCreationForm
from django.conf import settings

# backend lou e leo #################################################################
def pagina_login(request):
    if request.method == "POST":
        username = request.POST.get('username', '')
        senha = request.POST.get('password', '')
        user = authenticate(request, username=username, password=senha)
        if user is not None:
            login(request, user)
            return redirect('backstage:index')  # usa namespace do app
        return render(request, 'backstage/login.html', {'erro': 'Usuário ou senha inválidos'})
    return render(request, 'backstage/login.html')

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
    return render(request, 'backstage/index.html', context)

def sair(request):
    logout(request)
    return redirect('backstage:login')

def registrar(request):
    if request.user.is_authenticated:
        return redirect('backstage:index')

    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            usuario = form.save()
            login(request, usuario)
            return redirect('backstage:index')
    else:
        form = UserCreationForm()
    return render(request, 'backstage/register.html', {'form': form})

# chamadas das urls das páginas #################################################################################################
# front nononha e liz + back leo e lou

@login_required(login_url='backstage:login')
def comunidade(request):
    return render(request, "backstage/community.html")

def filmes(request):
    return render(request, "backstage/movie_details.html")

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
from django.shortcuts import get_object_or_404, redirect
from django.contrib import messages

#@login_required
def salvar_critica(request):
    if request.method == 'POST':
        texto = request.POST.get('texto')
        nota = request.POST.get('nota')
        filme_id = request.POST.get('filme_id')
        filme = get_object_or_404(Filme, tmdb_id=filme_id)

        if texto and nota:
            try:
                # Tenta encontrar uma crítica existente deste usuário para este filme
                critica = Critica.objects.filter(usuario=request.user, filme=filme).first()
                
                if critica:
                    # Atualiza a crítica existente
                    critica.texto = texto
                    critica.nota = int(nota)
                    critica.save()
                    messages.success(request, 'Crítica atualizada com sucesso!')
                else:
                    # Cria uma nova crítica
                    Critica.objects.create(
                        usuario=request.user,
                        filme=filme,
                        texto=texto,
                        nota=int(nota)
                    )
                    messages.success(request, 'Crítica adicionada com sucesso!')
            except Exception as e:
                messages.error(request, 'Erro ao salvar a crítica.')
        else:
            messages.error(request, 'Por favor, preencha a nota e o texto da crítica.')

#def get_criticas(request, filme_id):
    filme = get_object_or_404(Filme, tmdb_id=filme_id)
    criticas = Critica.objects.filter(filme=filme).order_by('-data')
    
    criticas_list = [{
        'usuario': critica.usuario.username,
        'texto': critica.texto,
        'nota': critica.nota,
        'data': critica.data.isoformat()
    } for critica in criticas]
    
    return JsonResponse({'criticas': criticas_list})

@login_required
def salvar_critica(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            filme_id = data.get('filme_id')
            texto = data.get('texto')
            nota = data.get('nota')

            if not all([filme_id, texto, nota]):
                return JsonResponse({'error': 'Dados incompletos'}, status=400)

            filme = get_object_or_404(Filme, tmdb_id=filme_id)
            
            # Verifica se já existe uma crítica deste usuário para este filme
            critica, created = Critica.objects.get_or_create(
                usuario=request.user,
                filme=filme,
                defaults={'texto': texto, 'nota': nota}
            )

            if not created:
                critica.texto = texto
                critica.nota = nota
                critica.save()

            return JsonResponse({'message': 'Crítica salva com sucesso!'})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Método não permitido'}, status=405)

@login_required(login_url='backstage:login')
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
    return render(request, "backstage/movie_details.html", context)

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
from django.http import JsonResponse
from .models import Critica

def relatorio(request):
    # Pega as 10 críticas mais recentes
    criticas = Critica.objects.select_related("filme").all().order_by("-criado_em")[:10]

    data = []
    for c in criticas:
        data.append({
            "filme": c.filme.titulo,
            "usuario": c.usuario.username if hasattr(c, "usuario") else "Anônimo",
            "nota": c.nota,
            "texto": c.texto,
            "criado_em": c.criado_em.strftime("%Y-%m-%d %H:%M"),
        })

    return JsonResponse({"relatorio": data})


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
