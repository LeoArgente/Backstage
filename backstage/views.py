from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from .models import Filme, Critica, Lista, ItemLista, Serie, CriticaSerie, ItemListaSerie, Comunidade, MembroComunidade
from django.contrib import messages
import json
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import UserCreationForm
from django.conf import settings
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from functools import wraps
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

def barra_buscar(request):
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

# Decorator personalizado para APIs que retorna JSON em vez de redirecionar

def api_login_required(function):
    @wraps(function)
    def wrap(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return JsonResponse({
                'success': False,
                'message': 'Você precisa estar logado para realizar esta ação.'
            }, status=401)
        return function(request, *args, **kwargs)
    return wrap

@login_required(login_url='backstage:login')
def salvar_critica(request):
    if request.method == 'POST':
        filme_id = request.POST.get('filme_id')
        nota = request.POST.get('nota')
        texto = request.POST.get('texto')
        tem_spoiler = request.POST.get('tem_spoiler') == 'on'  # checkbox retorna 'on' se marcado

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
                nota=nota_int,
                tem_spoiler=tem_spoiler
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
    return redirect('backstage:index')

def registrar(request): #suporta tanto forms tradicional quanto AJAX
    # Se já está logado, redireciona
    if request.user.is_authenticated:
        return redirect('backstage:index')

    if request.method == 'POST':
        # Detectar se é requisição AJAX (JSON) ou form tradicional
        is_ajax = request.content_type == 'application/json'
        
        try:
            if is_ajax:
                data = json.loads(request.body)
                username = data.get('username', '').strip()
                email = data.get('email', '').strip()
                password1 = data.get('password1', '')
                password2 = data.get('password2', '')
            else:
                username = request.POST.get('username', '').strip()
                email = request.POST.get('email', '').strip()
                password1 = request.POST.get('password1', '')
                password2 = request.POST.get('password2', '')

            errors = {}

            # Validações
            if not username:
                errors['username'] = 'Nome de usuário é obrigatório'
            elif len(username) < 3:
                errors['username'] = 'Nome de usuário deve ter pelo menos 3 caracteres'
            elif User.objects.filter(username=username).exists():
                errors['username'] = 'Este nome de usuário já existe'

            if not email:
                errors['email'] = 'Email é obrigatório'
            elif User.objects.filter(email=email).exists():
                errors['email'] = 'Este email já está cadastrado'

            if not password1:
                errors['password1'] = 'Senha é obrigatória'
            elif len(password1) < 8:
                errors['password1'] = 'Senha deve ter pelo menos 8 caracteres'

            if password1 != password2:
                errors['password2'] = 'As senhas não coincidem'

            if errors:
                if is_ajax:
                    return JsonResponse({
                        'success': False,
                        'errors': errors
                    })
                else:
                    return render(request, 'backstage/register.html', {
                        'errors': errors,
                        'username': username,
                        'email': email
                    })

            # Criar usuário
            usuario = User.objects.create_user(
                username=username,
                email=email,
                password=password1
            )
            login(request, usuario)
            
            if is_ajax:
                return JsonResponse({
                    'success': True,
                    'message': 'Conta criada com sucesso!'
                })
            else:
                return redirect('backstage:index')
                
        except json.JSONDecodeError:
            return JsonResponse({
                'success': False,
                'errors': {'general': 'Dados inválidos'}
            })
        except Exception as e:
            if is_ajax:
                return JsonResponse({
                    'success': False,
                    'errors': {'general': 'Erro interno do servidor'}
                })
            else:
                return render(request, 'backstage/register.html', {
                    'errors': {'general': 'Erro ao criar conta. Tente novamente.'}
                })
    
    return render(request, 'backstage/register.html')

# chamadas das urls das páginas #################################################################################################
# front nononha e liz + back leo e lou

@login_required(login_url='backstage:login')
def comunidade(request):
    # Buscar comunidades do usuário
    minhas_comunidades = MembroComunidade.objects.filter(
        usuario=request.user
    ).select_related('comunidade').order_by('-data_entrada')
    
    context = {
        'minhas_comunidades': minhas_comunidades,
    }
    return render(request, "backstage/community.html", context)

@login_required(login_url='backstage:login')
def minhas_comunidades(request):
    """Página com todas as comunidades do usuário"""
    comunidades = MembroComunidade.objects.filter(
        usuario=request.user
    ).select_related('comunidade').order_by('-data_entrada')
    
    context = {
        'comunidades': comunidades,
    }
    return render(request, "backstage/minhas_comunidades.html", context)

@login_required(login_url='backstage:login')
def detalhes_comunidade(request, slug):
    """Página de detalhes de uma comunidade específica"""
    comunidade = get_object_or_404(Comunidade, slug=slug)
    
    # Verificar se o usuário é membro
    try:
        membro = MembroComunidade.objects.get(comunidade=comunidade, usuario=request.user)
        meu_papel = membro.role
    except MembroComunidade.DoesNotExist:
        # Se não é membro e a comunidade é privada, negar acesso
        if not comunidade.publica:
            messages.error(request, 'Você não tem acesso a esta comunidade.')
            return redirect('backstage:comunidade')
        meu_papel = None
    
    # Buscar membros da comunidade
    membros = MembroComunidade.objects.filter(
        comunidade=comunidade
    ).select_related('usuario').order_by('role', '-data_entrada')
    
    # Buscar atividades recentes (implementar depois se necessário)
    atividades = []
    
    context = {
        'comunidade': comunidade,
        'meu_papel': meu_papel,
        'membros': membros,
        'atividades': atividades,
    }
    return render(request, "backstage/community_details.html", context)

@login_required(login_url='backstage:login')
@require_http_methods(["POST"])
def criar_comunidade(request):
    """API para criar nova comunidade"""
    try:
        nome = request.POST.get('nome')
        descricao = request.POST.get('descricao', '')
        publica = request.POST.get('publica') == 'on'
        
        if not nome:
            return JsonResponse({'success': False, 'error': 'Nome é obrigatório'})
        
        # Criar a comunidade
        comunidade = Comunidade.objects.create(
            nome=nome,
            descricao=descricao,
            publica=publica,
            criador=request.user
        )
        
        # Adicionar o criador como admin
        MembroComunidade.objects.create(
            comunidade=comunidade,
            usuario=request.user,
            role='admin'
        )
        
        return JsonResponse({
            'success': True,
            'message': 'Comunidade criada com sucesso!',
            'comunidade_slug': comunidade.slug
        })
        
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})

@login_required(login_url='backstage:login')
@require_http_methods(["POST"])
def entrar_comunidade(request):
    """API para entrar em uma comunidade pública"""
    try:
        slug = request.POST.get('slug')
        comunidade = get_object_or_404(Comunidade, slug=slug)
        
        if not comunidade.publica:
            return JsonResponse({'success': False, 'error': 'Esta comunidade é privada'})
        
        # Verificar se já é membro
        if MembroComunidade.objects.filter(comunidade=comunidade, usuario=request.user).exists():
            return JsonResponse({'success': False, 'error': 'Você já é membro desta comunidade'})
        
        # Adicionar como membro
        MembroComunidade.objects.create(
            comunidade=comunidade,
            usuario=request.user,
            role='member'
        )
        
        return JsonResponse({
            'success': True,
            'message': f'Você entrou na comunidade {comunidade.nome}!'
        })
        
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})

@login_required(login_url='backstage:login')
@require_http_methods(["POST"])
def sair_comunidade(request):
    """API para sair de uma comunidade"""
    try:
        data = json.loads(request.body)
        slug = data.get('slug')
        comunidade = get_object_or_404(Comunidade, slug=slug)
        
        # Verificar se é membro
        membro = get_object_or_404(MembroComunidade, comunidade=comunidade, usuario=request.user)
        
        # Admins não podem sair se são os únicos admins
        if membro.role == 'admin':
            admins_count = MembroComunidade.objects.filter(
                comunidade=comunidade, role='admin'
            ).count()
            if admins_count <= 1:
                return JsonResponse({
                    'success': False, 
                    'error': 'Você é o único admin. Promova outro membro antes de sair.'
                })
        
        membro.delete()
        
        return JsonResponse({
            'success': True,
            'message': f'Você saiu da comunidade {comunidade.nome}'
        })
        
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})

@login_required(login_url='backstage:login')
@require_http_methods(["POST"])
def convidar_amigo(request):
    """API para convidar amigo via email"""
    try:
        data = json.loads(request.body)
        email = data.get('email')
        slug = data.get('slug')
        
        comunidade = get_object_or_404(Comunidade, slug=slug)
        
        # Verificar se o usuário é admin ou moderador
        membro = get_object_or_404(MembroComunidade, comunidade=comunidade, usuario=request.user)
        if membro.role not in ['admin', 'mod']:
            return JsonResponse({'success': False, 'error': 'Apenas admins e moderadores podem convidar'})
        
        # Verificar se o usuário existe
        try:
            usuario_convidado = User.objects.get(email=email)
        except User.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Usuário não encontrado com este email'})
        
        # Verificar se já é membro
        if MembroComunidade.objects.filter(comunidade=comunidade, usuario=usuario_convidado).exists():
            return JsonResponse({'success': False, 'error': 'Este usuário já é membro da comunidade'})
        
        # Aqui você pode implementar envio de email ou notificação
        # Por enquanto, vamos apenas adicionar diretamente
        MembroComunidade.objects.create(
            comunidade=comunidade,
            usuario=usuario_convidado,
            role='member'
        )
        
        return JsonResponse({
            'success': True,
            'message': f'{usuario_convidado.username} foi adicionado à comunidade!'
        })
        
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})

@login_required(login_url='backstage:login')
def entrar_por_convite(request, codigo):
    """Entrar em comunidade usando código de convite"""
    try:
        comunidade = get_object_or_404(Comunidade, codigo_convite=codigo)
        
        # Verificar se já é membro
        if MembroComunidade.objects.filter(comunidade=comunidade, usuario=request.user).exists():
            messages.info(request, f'Você já é membro da comunidade {comunidade.nome}')
            return redirect('backstage:detalhes_comunidade', slug=comunidade.slug)
        
        if request.method == 'POST':
            # Adicionar como membro
            MembroComunidade.objects.create(
                comunidade=comunidade,
                usuario=request.user,
                role='member'
            )
            
            messages.success(request, f'Você entrou na comunidade {comunidade.nome}!')
            return JsonResponse({'success': True, 'redirect': f'/comunidade/{comunidade.slug}/'})
        
        return JsonResponse({
            'success': True,
            'message': f'Você foi convidado para a comunidade {comunidade.nome}'
        })
        
    except Comunidade.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Código de convite inválido'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})

def filmes(request):
    return render(request, "backstage/movie_details.html")

# back leo e lou ########################
@login_required(login_url='backstage:login')
def lists(request):
    from django.db.models import Count

    minhas_listas = Lista.objects.filter(usuario=request.user).annotate(
        num_filmes=Count('itens', distinct=True),
        num_series=Count('itens_serie', distinct=True)
    ).order_by('-atualizada_em')

    listas_publicas = Lista.objects.filter(publica=True).exclude(usuario=request.user).annotate(
        num_filmes=Count('itens', distinct=True),
        num_series=Count('itens_serie', distinct=True)
    ).order_by('-atualizada_em')

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

def detalhes_filme(request, tmdb_id):

    dados_filme = obter_detalhes_com_cache(tmdb_id)

    # Formatar data de lançamento para formato brasileiro
    if dados_filme.get('data_lancamento'):
        from datetime import datetime
        try:
            data_obj = datetime.strptime(dados_filme['data_lancamento'], '%Y-%m-%d')
            dados_filme['data_lancamento_formatada'] = data_obj.strftime('%d/%m/%Y')
        except:
            dados_filme['data_lancamento_formatada'] = dados_filme['data_lancamento']
    else:
        dados_filme['data_lancamento_formatada'] = None

    # Criar ou buscar filme local para críticas
    filme_local, created = Filme.objects.get_or_create(
        tmdb_id=tmdb_id,
        defaults={
            'titulo': dados_filme.get('titulo', ''),
            'descricao': dados_filme.get('sinopse', ''),
        })

    # Buscar críticas locais
    criticas = Critica.objects.filter(filme=filme_local)

    # Passar dados de crew e cast para o JavaScript via JSON
    # Garantir que sempre sejam listas válidas, mesmo que vazias
    equipe = dados_filme.get('equipe', []) or []
    elenco_principal = dados_filme.get('elenco_principal', []) or []

    # Log de depuração
    print(f"[DEBUG] TMDb ID: {tmdb_id}")
    print(f"[DEBUG] Equipe encontrada: {len(equipe)} membros")
    print(f"[DEBUG] Elenco encontrado: {len(elenco_principal)} membros")
    if equipe:
        print(f"[DEBUG] Exemplo de membro da equipe: {equipe[0]}")
    if elenco_principal:
        print(f"[DEBUG] Exemplo de membro do elenco: {elenco_principal[0]}")

    context = {
        'filme': dados_filme,
        'filme_local': filme_local,
        'criticas': criticas,
        'tmdb_image_base': settings.TMDB_IMAGE_BASE_URL,
        'crew_data_json': json.dumps(equipe),
        'cast_data_json': json.dumps(elenco_principal)
    }
    return render(request, "backstage/movie_details.html", context)

def buscar(request):
    from .services.tmdb import (
        buscar_filme_por_titulo, 
        buscar_pessoa_por_nome, 
        buscar_filmes_por_pessoa,
        buscar_generos,
        buscar_filmes_por_genero,
        buscar_serie_por_titulo
    )
    
    query = request.GET.get('q', '').strip()
    tipo_busca = request.GET.get('tipo', 'titulo')  # titulo, pessoa, genero
    resultados_filmes = []
    resultados_pessoas = []
    generos = []
    
    try:
        # Buscar gêneros para o filtro
        generos = buscar_generos()
    except:
        generos = []

    if query:
        try:
            if tipo_busca == 'titulo':
                 # Busca por título (filmes e séries)
                filmes = buscar_filme_por_titulo(query)
                series = buscar_serie_por_titulo(query)
                
                # Adicionar tipo para diferenciação
                for filme in filmes:
                    filme['tipo'] = 'filme'
                for serie in series:
                    serie['tipo'] = 'serie'
                
                resultados_filmes = filmes + series
            elif tipo_busca == 'pessoa':
                # Busca por pessoa (ator/diretor)
                pessoas = buscar_pessoa_por_nome(query)
                resultados_pessoas = pessoas[:5]  # Limitar a 5 pessoas
                
                # Se encontrou pessoas, buscar filmes da primeira pessoa
                if pessoas:
                    primeira_pessoa = pessoas[0]
                    resultados_filmes = buscar_filmes_por_pessoa(primeira_pessoa.get('id'))
            elif tipo_busca == 'genero':
                # Buscar gênero pelo nome
                genero_encontrado = None
                for genero in generos:
                    if query.lower() in genero.get('name', '').lower():
                        genero_encontrado = genero
                        break
                
                if genero_encontrado:
                    resultados_filmes = buscar_filmes_por_genero(genero_encontrado.get('id'))
            else:
                # Busca geral (título + pessoa)
                resultados_filmes = buscar_filme_por_titulo(query)
                
        except Exception as e:
            print(f"Erro na busca: {e}")
            resultados_filmes = []
            resultados_pessoas = []

    context = {
        'query': query,
        'tipo_busca': tipo_busca,
        'resultados_filmes': resultados_filmes,
        'resultados_pessoas': resultados_pessoas,
        'generos': generos,
        'tmdb_image_base': settings.TMDB_IMAGE_BASE_URL
    }
    return render(request, "backstage/busca_resultado.html", context)

def busca_ajax(request):
    """API endpoint para busca em tempo real"""
    query = request.GET.get('q', '').strip()
    
    if not query or len(query) < 2:
        return JsonResponse({'results': []})
    
    try:
        from .services.tmdb import buscar_filme_por_titulo, buscar_serie_por_titulo
        
        # Buscar filmes e séries (limitado a 5 cada)
        filmes = buscar_filme_por_titulo(query)[:5]
        series = buscar_serie_por_titulo(query)[:5]
        
        # Formatar resultados
        resultados = []
        
        for filme in filmes:
            resultados.append({
                'id': filme['tmdb_id'],
                'titulo': filme['titulo'],
                'ano': filme['ano_lancamento'],
                'poster': f"{settings.TMDB_IMAGE_BASE_URL}w200{filme['poster_path']}" if filme['poster_path'] else None,
                'tipo': 'filme',
                'url': f"/filmes/{filme['tmdb_id']}/"
            })
        
        for serie in series:
            resultados.append({
                'id': serie['tmdb_id'],
                'titulo': serie['titulo'],
                'ano': serie['ano_lancamento'],
                'poster': f"{settings.TMDB_IMAGE_BASE_URL}w200{serie['poster_path']}" if serie['poster_path'] else None,
                'tipo': 'serie',
                'url': f"/series/{serie['tmdb_id']}/"
            })
        
        return JsonResponse({'results': resultados})
        
    except Exception as e:
        return JsonResponse({'results': [], 'error': str(e)})


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

@api_login_required
@require_http_methods(["POST"])
def criar_lista(request):
    try:
        # Verificar se o corpo da requisição não está vazio
        if not request.body:
            return JsonResponse({'success': False, 'message': 'Corpo da requisição está vazio'})

        # Tentar fazer o parse do JSON
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError as je:
            return JsonResponse({'success': False, 'message': f'JSON inválido: {str(je)}'})

        # Verificar se o nome foi fornecido
        if 'nome' not in data or not data['nome']:
            return JsonResponse({'success': False, 'message': 'Nome da lista é obrigatório'})

        # Criar a lista
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

    except KeyError as ke:
        return JsonResponse({'success': False, 'message': f'Campo obrigatório ausente: {str(ke)}'})
    except Exception as e:
        return JsonResponse({'success': False, 'message': f'Erro ao criar lista: {str(e)}'})

@api_login_required
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

@api_login_required
def buscar_listas_usuario(request):
    try:
        # Obtém o tipo de conteúdo (filme ou serie) dos parâmetros da query
        tipo = request.GET.get('tipo', 'filme')

        listas = Lista.objects.filter(usuario=request.user).order_by('-atualizada_em')
        listas_data = [{
            'id': lista.id,
            'nome': lista.nome,
            'descricao': lista.descricao,
            'publica': lista.publica,
            'count': lista.itens_serie.count() if tipo == 'serie' else lista.itens.count()
        } for lista in listas]

        return JsonResponse({
            'success': True,
            'listas': listas_data
        })
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)})

@api_login_required
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

@api_login_required
@require_http_methods(["GET", "PUT"])
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

@api_login_required
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

@api_login_required
@require_http_methods(["GET"])
def visualizar_lista(request, lista_id):
    try:
        # Buscar lista do usuário ou lista pública
        try:
            lista = Lista.objects.get(id=lista_id, usuario=request.user)
        except Lista.DoesNotExist:
            lista = Lista.objects.get(id=lista_id, publica=True)

        # Buscar itens de filmes da lista
        itens_filmes = lista.itens.all().order_by('posicao')
        filmes_data = []
        for item in itens_filmes:
            filmes_data.append({
                'tipo': 'filme',
                'tmdb_id': item.filme.tmdb_id,
                'titulo': item.filme.titulo,
                'descricao': item.filme.descricao,
                'adicionado_em': item.adicionado_em.strftime('%d/%m/%Y'),
                'posicao': item.posicao
            })

        # Buscar itens de séries da lista
        itens_series = lista.itens_serie.all().order_by('posicao')
        series_data = []
        for item in itens_series:
            series_data.append({
                'tipo': 'serie',
                'tmdb_id': item.serie.tmdb_id,
                'titulo': item.serie.titulo,
                'descricao': item.serie.descricao,
                'adicionado_em': item.adicionado_em.strftime('%d/%m/%Y'),
                'posicao': item.posicao
            })

        # Combinar filmes e séries
        todos_itens = filmes_data + series_data

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
                'itens': todos_itens,
                'total_itens': len(todos_itens),
                'total_filmes': len(filmes_data),
                'total_series': len(series_data)
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

@api_login_required
def adicionar_serie_lista(request, lista_id, tmdb_id):
    try:
        lista = Lista.objects.get(id=lista_id, usuario=request.user)
        serie, _ = Serie.objects.get_or_create(
            tmdb_id=tmdb_id,
            defaults={'titulo': 'Série TMDB ' + str(tmdb_id)}
        )

        item, created = ItemListaSerie.objects.get_or_create(
            lista=lista,
            serie=serie,
            defaults={'posicao': lista.itens_serie.count()}
        )

        if created:
            return JsonResponse({'success': True, 'message': 'Série adicionada à lista!'})
        else:
            return JsonResponse({'success': False, 'message': 'Série já está na lista!'})

    except Lista.DoesNotExist:
        return JsonResponse({'success': False, 'message': 'Lista não encontrada!'})
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)})

@api_login_required
def remover_serie_da_lista(request, lista_id, tmdb_id):
    if request.method != 'DELETE':
        return JsonResponse({'success': False, 'message': 'Método não permitido'})

    try:
        lista = Lista.objects.get(id=lista_id, usuario=request.user)
        serie = Serie.objects.get(tmdb_id=tmdb_id)
        item = ItemListaSerie.objects.get(lista=lista, serie=serie)

        item.delete()

        return JsonResponse({
            'success': True,
            'message': 'Série removida da lista com sucesso!'
        })

    except (Lista.DoesNotExist, Serie.DoesNotExist, ItemListaSerie.DoesNotExist):
        return JsonResponse({'success': False, 'message': 'Item não encontrado!'})
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)})

@api_login_required
@require_http_methods(["POST"])
def remover_item_lista(request, lista_id):
    """Remove filme ou série da lista"""
    try:
        data = json.loads(request.body)
        tmdb_id = data.get('tmdb_id')
        tipo = data.get('tipo')

        if not tmdb_id or not tipo:
            return JsonResponse({'success': False, 'message': 'Dados incompletos'})

        lista = Lista.objects.get(id=lista_id, usuario=request.user)

        if tipo == 'filme':
            filme = Filme.objects.get(tmdb_id=tmdb_id)
            item = ItemLista.objects.get(lista=lista, filme=filme)
            item.delete()
            mensagem = 'Filme removido da lista com sucesso!'
        elif tipo == 'serie':
            serie = Serie.objects.get(tmdb_id=tmdb_id)
            item = ItemListaSerie.objects.get(lista=lista, serie=serie)
            item.delete()
            mensagem = 'Série removida da lista com sucesso!'
        else:
            return JsonResponse({'success': False, 'message': 'Tipo inválido'})

        return JsonResponse({
            'success': True,
            'message': mensagem
        })

    except Lista.DoesNotExist:
        return JsonResponse({'success': False, 'message': 'Lista não encontrada!'})
    except (Filme.DoesNotExist, Serie.DoesNotExist):
        return JsonResponse({'success': False, 'message': 'Item não encontrado no banco!'})
    except (ItemLista.DoesNotExist, ItemListaSerie.DoesNotExist):
        return JsonResponse({'success': False, 'message': 'Item não está na lista!'})
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)})

def detalhes_serie(request, tmdb_id):
    """View para mostrar detalhes de uma série"""

    # Buscar dados da API
    dados_serie = buscar_detalhes_serie(tmdb_id)
    
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

    # Converter temporadas e vídeos para JSON
    import json
    temporadas_json = json.dumps(dados_serie.get('temporadas', []))
    videos_json = json.dumps(dados_serie.get('videos', []))

    context = {
        'serie': dados_serie,
        'serie_local': serie_local,
        'criticas': criticas,
        'tmdb_image_base': settings.TMDB_IMAGE_BASE_URL,
        'temporadas_json': temporadas_json,
        'videos_json': videos_json
    }

    return render(request, "backstage/series_details.html", context)

@login_required(login_url='backstage:login')
def salvar_critica_serie(request):
    """Salvar crítica de série"""
    if request.method == 'POST':
        serie_id = request.POST.get('serie_id')
        nota = request.POST.get('nota')
        texto = request.POST.get('texto')
        tem_spoiler = request.POST.get('tem_spoiler') == 'on'  # checkbox retorna 'on' se marcado
        
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
                nota=nota_int,
                tem_spoiler=tem_spoiler
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