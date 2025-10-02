from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from .models import Filme, Critica, Lista, ItemLista, Serie, CriticaSerie
from django.contrib import messages
import json
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import UserCreationForm
from django.conf import settings
from django.views.decorators.http import require_http_methods
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from .services.tmdb import (
    obter_detalhes_com_cache,
    montar_payload_agregado,
    obter_top_filmes,
    obter_recomendados,
    obter_goats,
    obter_em_cartaz,
    obter_classicos,
    converter_para_estrelas,
    buscar_series_populares,
    buscar_detalhes_serie,
    buscar_temporada,
    buscar_filme_destaque,
    buscar_filmes_populares,
    buscar_filme_por_titulo,
)
#####################
from django.db.models import Q
from django.core.paginator import Paginator
from rapidfuzz import fuzz

def buscar(request):
    query = request.GET.get("q", "").strip()
    resultados = []

    if query:
        candidatos = Filme.objects.filter(
            Q(title__icontains=query) |
            Q(cast__icontains=query) |
            Q(genre__icontains=query)
        )

        resultados = []
        for filme in candidatos:
            score_title = fuzz.partial_ratio(query.lower(), filme.title.lower())
            score_cast = fuzz.partial_ratio(query.lower(), filme.cast.lower())
            score_genre = fuzz.partial_ratio(query.lower(), filme.genre.lower())
            score = max(score_title, score_cast, score_genre)
            resultados.append((filme, score))

        # Ordena pela relação com o termo buscado (maior primeiro)
        resultados.sort(key=lambda x: x[1], reverse=True)

        # Mantém só os objetos Filme
        resultados = [r[0] for r in resultados]

    # 🔹 Paginação: 10 resultados por página
    paginator = Paginator(resultados, 10)
    page_number = request.GET.get("page")
    page_obj = paginator.get_page(page_number)

    return render(request, "results.html", {
        "query": query,
        "page_obj": page_obj,  # objeto de paginação
    })
########################

@login_required(login_url='backstage:login')
def salvar_critica(request):
    if request.method == 'POST':
        filme_id = request.POST.get('filme_id')
        nota = request.POST.get('nota')
        texto = request.POST.get('texto')

        if not filme_id or not texto:
            messages.error(request, 'Filme e texto da crítica são obrigatórios.')
            return redirect(f'/filmes/{filme_id}/')

        if not nota or nota == '':
            messages.error(request, 'Por favor, selecione uma nota de 1 a 5 estrelas.')
            return redirect(f'/filmes/{filme_id}/')

        try:
            # Validar nota
            nota_int = int(float(nota))
            if nota_int < 1 or nota_int > 5:
                messages.error(request, 'A nota deve ser entre 1 e 5.')
                return redirect(f'/filmes/{filme_id}/')

            # Criar ou buscar o filme no banco local
            filme, created = Filme.objects.get_or_create(
                tmdb_id=int(filme_id),
                defaults={'titulo': f'Filme TMDb {filme_id}'}
            )

            # Criar a crítica
            critica = Critica.objects.create(
                filme=filme,
                usuario=request.user,
                texto=texto,
                nota=nota_int
            )

            messages.success(request, 'Sua avaliação foi salva com sucesso!')
            return redirect(f'/filmes/{filme_id}/')

        except Exception as e:
            messages.error(request, f'Erro ao salvar avaliação: {str(e)}')
            return redirect(f'/filmes/{filme_id}/')

    else:
        messages.error(request, 'Método não permitido.')
        return redirect('backstage:index')

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

def registrar_ajax(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username', '').strip()
            email = data.get('email', '').strip()
            password1 = data.get('password1', '')
            password2 = data.get('password2', '')

            # Validações
            errors = {}

            # Validar username
            if not username:
                errors['username'] = 'Nome de usuário é obrigatório'
            elif len(username) < 3:
                errors['username'] = 'Nome de usuário deve ter pelo menos 3 caracteres'
            elif User.objects.filter(username=username).exists():
                errors['username'] = 'Este nome de usuário já existe'

            # Validar email
            if not email:
                errors['email'] = 'Email é obrigatório'
            elif User.objects.filter(email=email).exists():
                errors['email'] = 'Este email já está cadastrado'

            # Validar senhas
            if not password1:
                errors['password1'] = 'Senha é obrigatória'
            elif len(password1) < 8:
                errors['password1'] = 'Senha deve ter pelo menos 8 caracteres'

            if not password2:
                errors['password2'] = 'Confirmação de senha é obrigatória'
            elif password1 != password2:
                errors['password2'] = 'As senhas não coincidem'

            if errors:
                return JsonResponse({
                    'success': False,
                    'errors': errors
                })

            # Criar usuário
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password1
            )

            # Fazer login automático
            login(request, user)

            return JsonResponse({
                'success': True,
                'message': 'Conta criada com sucesso!'
            })

        except json.JSONDecodeError:
            return JsonResponse({
                'success': False,
                'errors': {'general': 'Dados inválidos'}
            })
        except Exception as e:
            return JsonResponse({
                'success': False,
                'errors': {'general': 'Erro interno do servidor'}
            })

    return JsonResponse({
        'success': False,
        'errors': {'general': 'Método não permitido'}
    })

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

# back leo e lou ########################
@login_required(login_url='backstage:login')
def lists(request):
    minhas_listas = Lista.objects.filter(usuario=request.user).order_by('-atualizada_em')
    listas_publicas = Lista.objects.filter(publica=True).exclude(usuario=request.user).order_by('-atualizada_em')

    context = {
        'minhas_listas': minhas_listas,
        'listas_publicas': listas_publicas,
    }
    return render(request, "backstage/lists.html", context)

def movies(request):

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

@login_required(login_url='backstage:login')
def adicionar_critica(request, tmdb_id):

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

def filmes_home(request):
    """API endpoint que retorna dados para a página inicial com cache"""
    try:
        # Buscar dados com cache
        hero_movies = obter_top_filmes(limit=5)
        goats = obter_goats(limit=20)
        recommended = obter_recomendados(limit=12)
        em_cartaz = obter_em_cartaz(limit=12)
        classicos = obter_classicos(limit=12)

        # Adicionar URL base para imagens
        tmdb_image_base = settings.TMDB_IMAGE_BASE_URL
        tmdb_backdrop_base = settings.TMDB_BACKDROP_BASE_URL

        # Adicionar URLs completas para as imagens
        for movie in hero_movies + goats + recommended + em_cartaz + classicos:
            if movie.get('poster_path'):
                movie['poster_url'] = f"{tmdb_image_base}{movie['poster_path']}"
            else:
                movie['poster_url'] = None

            if movie.get('backdrop_path'):
                movie['backdrop_url'] = f"{tmdb_backdrop_base}{movie['backdrop_path']}"
            else:
                movie['backdrop_url'] = None

        return JsonResponse({
            'success': True,
            'hero_movies': hero_movies,
            'goats': goats,
            'recommended': recommended,
            'em_cartaz': em_cartaz,
            'classicos': classicos,
            'image_base_url': tmdb_image_base,
            'backdrop_base_url': tmdb_backdrop_base
        })

    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e),
            'hero_movies': [],
            'goats': [],
            'recommended': [],
            'em_cartaz': [],
            'classicos': []
        }, status=500)


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


# back lou e leo #########################################
# dados da API

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

@login_required(login_url='backstage:login')
#@require_http_methods(["POST"])
def criar_lista(request):
    try:
        data = json.loads(request.body)
        lista = Lista.objects.create(
            nome=data['nome'],
            descricao=data.get('descricao', ''),
            usuario=request.user,
            publica=data.get('publica', False)
        )
        return JsonResponse({
            'success': True,
            'lista_id': lista.id,
            'message': 'Lista criada com sucesso!'
        })
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)})

@login_required(login_url='backstage:login')
def buscar_ou_criar_lista_watch_later(request):
    try:
        lista, created = Lista.objects.get_or_create(
            usuario=request.user,
            nome='Assistir Mais Tarde',
            defaults={
                'descricao': 'Filmes para assistir mais tarde',
                'publica': False
            }
        )
        return JsonResponse({
            'success': True,
            'lista_id': lista.id,
            'created': created,
            'message': 'Lista criada com sucesso!' if created else 'Lista encontrada!'
        })
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)})

@login_required(login_url='backstage:login')
def buscar_listas_usuario(request):
    try:
        listas = Lista.objects.filter(usuario=request.user).order_by('-atualizada_em')
        listas_data = [{
            'id': lista.id,
            'nome': lista.nome,
            'descricao': lista.descricao,
            'publica': lista.publica,
            'count': lista.itens.count()
        } for lista in listas]

        return JsonResponse({
            'success': True,
            'listas': listas_data
        })
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)})

@login_required(login_url='backstage:login')
@require_http_methods(["POST"])
def adicionar_filme_lista(request, lista_id, tmdb_id):
    try:
        lista = Lista.objects.get(id=lista_id, usuario=request.user)
        filme, _ = Filme.objects.get_or_create(
            tmdb_id=tmdb_id,
            defaults={'titulo': 'Filme TMDB ' + str(tmdb_id)}
        )

        item, created = ItemLista.objects.get_or_create(
            lista=lista,
            filme=filme,
            defaults={'posicao': lista.itens.count()}
        )

        if created:
            return JsonResponse({'success': True, 'message': 'Filme adicionado à lista!'})
        else:
            return JsonResponse({'success': False, 'message': 'Filme já está na lista!'})
    
    except Lista.DoesNotExist:
        return JsonResponse({'success': False, 'message': 'Lista não encontrada!'})
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)})

@login_required(login_url='backstage:login')
def editar_lista(request, lista_id):
    try:
        lista = Lista.objects.get(id=lista_id, usuario=request.user)

        if request.method == 'GET':
            return JsonResponse({
                'success': True,
                'lista': {
                    'id': lista.id,
                    'nome': lista.nome,
                    'descricao': lista.descricao,
                    'publica': lista.publica
                }
            })

        elif request.method == 'PUT':
            data = json.loads(request.body)
            lista.nome = data.get('nome', lista.nome)
            lista.descricao = data.get('descricao', lista.descricao)
            lista.publica = data.get('publica', lista.publica)
            lista.save()

            return JsonResponse({
                'success': True,
                'message': 'Lista atualizada com sucesso!'
            })

    except Lista.DoesNotExist:
        return JsonResponse({'success': False, 'message': 'Lista não encontrada!'})
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)})

@login_required(login_url='backstage:login')
def deletar_lista(request, lista_id):
    if request.method != 'DELETE':
        return JsonResponse({'success': False, 'message': 'Método não permitido'})

    try:
        lista = Lista.objects.get(id=lista_id, usuario=request.user)
        nome_lista = lista.nome
        lista.delete()

        return JsonResponse({
            'success': True,
            'message': f'Lista "{nome_lista}" deletada com sucesso!'
        })

    except Lista.DoesNotExist:
        return JsonResponse({'success': False, 'message': 'Lista não encontrada!'})
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)})

@login_required(login_url='backstage:login')
def visualizar_lista(request, lista_id):
    try:
        # Buscar lista do usuário ou lista pública
        try:
            lista = Lista.objects.get(id=lista_id, usuario=request.user)
        except Lista.DoesNotExist:
            lista = Lista.objects.get(id=lista_id, publica=True)

        # Buscar itens da lista com detalhes dos filmes
        itens = lista.itens.all().order_by('posicao')
        filmes_data = []

        for item in itens:
            filmes_data.append({
                'tmdb_id': item.filme.tmdb_id,
                'titulo': item.filme.titulo,
                'descricao': item.filme.descricao,
                'adicionado_em': item.adicionado_em.strftime('%d/%m/%Y'),
                'posicao': item.posicao
            })

        return JsonResponse({
            'success': True,
            'lista': {
                'id': lista.id,
                'nome': lista.nome,
                'descricao': lista.descricao,
                'publica': lista.publica,
                'usuario': lista.usuario.username,
                'criada_em': lista.criada_em.strftime('%d/%m/%Y'),
                'atualizada_em': lista.atualizada_em.strftime('%d/%m/%Y'),
                'filmes': filmes_data,
                'total_filmes': len(filmes_data)
            }
        })

    except Lista.DoesNotExist:
        return JsonResponse({'success': False, 'message': 'Lista não encontrada!'})
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)})

@login_required(login_url='backstage:login')
def remover_filme_da_lista(request, lista_id, tmdb_id):
    if request.method != 'DELETE':
        return JsonResponse({'success': False, 'message': 'Método não permitido'})

    try:
        lista = Lista.objects.get(id=lista_id, usuario=request.user)
        filme = Filme.objects.get(tmdb_id=tmdb_id)
        item = ItemLista.objects.get(lista=lista, filme=filme)

        item.delete()

        return JsonResponse({
            'success': True,
            'message': 'Filme removido da lista com sucesso!'
        })

    except (Lista.DoesNotExist, Filme.DoesNotExist, ItemLista.DoesNotExist):
        return JsonResponse({'success': False, 'message': 'Item não encontrado!'})
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)})
    
def detalhes_serie(request, tmdb_id):
    """View para mostrar detalhes de uma série"""
    
    try:
        # Buscar dados da API
        dados_serie = buscar_detalhes_serie(tmdb_id)
    except:
        return render(request, '404.html', {'erro': 'Série não encontrada'})
    
    # Criar ou buscar série no banco local
    serie_local, created = Serie.objects.get_or_create(
        tmdb_id=tmdb_id,
        defaults={
            'titulo': dados_serie.get('titulo', ''),
            'descricao': dados_serie.get('sinopse', ''),
            'numero_temporadas': dados_serie.get('numero_temporadas', 0),
            'numero_episodios': dados_serie.get('numero_episodios', 0),
            'status': dados_serie.get('status', ''),
        }
    )
    
    # Buscar críticas locais
    criticas = CriticaSerie.objects.filter(serie=serie_local).order_by('-criado_em')
    
    context = {
        'serie': dados_serie,
        'serie_local': serie_local,
        'criticas': criticas,
        'tmdb_image_base': settings.TMDB_IMAGE_BASE_URL
    }
    
    return render(request, "backstage/series_details.html", context)

@login_required(login_url='backstage:login')
def salvar_critica_serie(request):
    """Salvar crítica de série"""
    if request.method == 'POST':
        serie_id = request.POST.get('serie_id')
        nota = request.POST.get('nota')
        texto = request.POST.get('texto')
        
        if not serie_id or not texto or not nota:
            messages.error(request, 'Todos os campos são obrigatórios.')
            return redirect(f'/series/{serie_id}/')
        
        try:
            nota_int = int(float(nota))
            if nota_int < 1 or nota_int > 5:
                messages.error(request, 'A nota deve ser entre 1 e 5.')
                return redirect(f'/series/{serie_id}/')
            
            # Criar ou buscar série local
            serie, created = Serie.objects.get_or_create(
                tmdb_id=int(serie_id),
                defaults={'titulo': f'Série TMDb {serie_id}'}
            )
            
            # Criar crítica
            CriticaSerie.objects.create(
                serie=serie,
                usuario=request.user,
                texto=texto,
                nota=nota_int
            )
            
            messages.success(request, 'Sua avaliação foi salva com sucesso!')
            return redirect(f'/series/{serie_id}/')
            
        except Exception as e:
            messages.error(request, f'Erro ao salvar avaliação: {str(e)}')
            return redirect(f'/series/{serie_id}/')
    else:
        messages.error(request, 'Método não permitido.')
        return redirect('backstage:index')

def buscar_temporada_api(request, tmdb_id, numero_temporada):
    """API endpoint para buscar episódios de uma temporada"""
    
    try:
        dados_temporada = buscar_temporada(tmdb_id, numero_temporada)
        return JsonResponse({
            'success': True,
            'temporada': dados_temporada
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
            }, status=500)