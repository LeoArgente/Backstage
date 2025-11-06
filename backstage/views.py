from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from .models import Filme, Critica, Lista, ItemLista, Serie, CriticaSerie, ItemListaSerie, Comunidade, MembroComunidade, SolicitacaoAmizade, Amizade, DiarioFilme
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
            
            # Backfill título se estiver vazio ou temporário
            if not filme.titulo or filme.titulo.startswith('Filme TMDb'):
                detalhes = obter_detalhes_com_cache(int(filme_id))
                if detalhes and isinstance(detalhes, dict):
                    filme.titulo = detalhes.get('titulo') or detalhes.get('title') or f'Filme TMDb {filme_id}'
                    filme.descricao = detalhes.get('sinopse') or detalhes.get('overview') or ''
                    if detalhes.get('poster_path'):
                        filme.poster = f"https://image.tmdb.org/t/p/w500{detalhes['poster_path']}"
                    if detalhes.get('data_lancamento'):
                        filme.data_lancamento = detalhes.get('data_lancamento')
                    filme.save()

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
                    return render(request, 'backstage/registrar.html', {
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
                return render(request, 'backstage/registrar.html', {
                    'errors': {'general': 'Erro ao criar conta. Tente novamente.'}
                })

    return render(request, 'backstage/registrar.html')

# chamadas das urls das páginas #################################################################################################
# front nononha e liz + back leo e lou

@login_required(login_url='backstage:login')
def comunidade(request):
    # Buscar comunidades do usuário (se estiver autenticado)
    minhas_comunidades = []
    if request.user.is_authenticated:
        minhas_comunidades = MembroComunidade.objects.filter(
            usuario=request.user
        ).select_related('comunidade').order_by('-data_entrada')
    
    # Buscar todas as comunidades públicas
    comunidades_publicas = Comunidade.objects.filter(
        publica=True
    ).order_by('-data_criacao')
    
    # Se o usuário estiver autenticado, excluir as que ele já é membro
    if request.user.is_authenticated:
        ids_minhas_comunidades = [mc.comunidade.id for mc in minhas_comunidades]
        comunidades_publicas = comunidades_publicas.exclude(id__in=ids_minhas_comunidades)
    
    context = {
        'minhas_comunidades': minhas_comunidades,
        'comunidades_publicas': comunidades_publicas,
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
@login_required(login_url='backstage:login')
@require_http_methods(["POST"])
def criar_comunidade(request):
    """API para criar nova comunidade"""
    try:
        nome = request.POST.get('nome', '').strip()
        descricao = request.POST.get('descricao', '').strip()
        publica = request.POST.get('publica') == 'on'
        
        # Validações
        if not nome:
            return JsonResponse({'success': False, 'error': 'Nome é obrigatório'}, status=400)
        
        if len(nome) > 100:
            return JsonResponse({'success': False, 'error': 'Nome deve ter no máximo 100 caracteres'}, status=400)
        
        # Criar a comunidade (será salva automaticamente no banco)
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
            'comunidade_slug': comunidade.slug,
            'comunidade_id': comunidade.id,
            'codigo_convite': comunidade.codigo_convite
        })
        
    except Exception as e:
        import traceback
        traceback.print_exc()  # Para debug no console do servidor
        return JsonResponse({
            'success': False, 
            'error': f'Erro ao criar comunidade: {str(e)}'
        }, status=500)

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
        filme, created = Filme.objects.get_or_create(
            tmdb_id=tmdb_id,
            defaults={'titulo': 'Filme TMDB ' + str(tmdb_id)}
        )
        
        # Backfill título se estiver vazio ou temporário
        if not filme.titulo or filme.titulo.startswith('Filme TMDB'):
            detalhes = obter_detalhes_com_cache(tmdb_id)
            if detalhes and isinstance(detalhes, dict):
                filme.titulo = detalhes.get('titulo') or detalhes.get('title') or f'Filme TMDB {tmdb_id}'
                filme.descricao = detalhes.get('sinopse') or detalhes.get('overview') or ''
                if detalhes.get('poster_path'):
                    filme.poster = f"https://image.tmdb.org/t/p/w500{detalhes['poster_path']}"
                if detalhes.get('data_lancamento'):
                    filme.data_lancamento = detalhes.get('data_lancamento')
                filme.save()

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

def buscar_sugestoes(request):
    """API para sugestões de busca em tempo real"""
    query = request.GET.get('q', '').strip()
    print(f"\n=== BUSCAR_SUGESTOES ===")
    print(f"Query recebida: '{query}'")
    
    if not query or len(query) < 2:
        print("Query muito curta, retornando vazio")
        return JsonResponse({'sugestoes': []})
    
    try:
        import requests
        from django.conf import settings
        
        # Buscar filmes
        url_filmes = f"https://api.themoviedb.org/3/search/movie"
        params_filmes = {
            'api_key': settings.TMDB_API_KEY,
            'language': 'pt-BR',
            'query': query,
            'page': 1
        }
        print(f"Buscando filmes na TMDb: {url_filmes}")
        response_filmes = requests.get(url_filmes, params=params_filmes, timeout=5)
        print(f"Status da resposta TMDb (filmes): {response_filmes.status_code}")
        filmes = response_filmes.json().get('results', [])[:5]  # Limitar a 5 resultados
        print(f"Filmes encontrados: {len(filmes)}")
        
        # Buscar séries
        url_series = f"https://api.themoviedb.org/3/search/tv"
        params_series = {
            'api_key': settings.TMDB_API_KEY,
            'language': 'pt-BR',
            'query': query,
            'page': 1
        }
        response_series = requests.get(url_series, params=params_series, timeout=5)
        series = response_series.json().get('results', [])[:5]  # Limitar a 5 resultados
        
        # Formatar resultados
        sugestoes = []
        
        # Adicionar filmes
        for filme in filmes:
            filme_data = {
                'id': filme.get('id'),
                'tipo': 'filme',
                'titulo': filme.get('title', 'Sem título'),
                'poster': f"https://image.tmdb.org/t/p/w92{filme.get('poster_path')}" if filme.get('poster_path') else None,
                'ano': filme.get('release_date', '')[:4] if filme.get('release_date') else '',
                'descricao': filme.get('overview', 'Sem descrição disponível')[:150] + '...' if filme.get('overview') else 'Sem descrição disponível',
                'nota': round(filme.get('vote_average', 0), 1),
                'url': f"/filmes/{filme.get('id')}/"
            }
            sugestoes.append(filme_data)
            print(f"  - Filme: {filme_data['titulo']} ({filme_data['ano']})")
        
        # Adicionar séries
        for serie in series:
            serie_data = {
                'id': serie.get('id'),
                'tipo': 'serie',
                'titulo': serie.get('name', 'Sem título'),
                'poster': f"https://image.tmdb.org/t/p/w92{serie.get('poster_path')}" if serie.get('poster_path') else None,
                'ano': serie.get('first_air_date', '')[:4] if serie.get('first_air_date') else '',
                'descricao': serie.get('overview', 'Sem descrição disponível')[:150] + '...' if serie.get('overview') else 'Sem descrição disponível',
                'nota': round(serie.get('vote_average', 0), 1),
                'url': f"/series/{serie.get('id')}/"
            }
            sugestoes.append(serie_data)
            print(f"  - Série: {serie_data['titulo']} ({serie_data['ano']})")
        
        print(f"Total de sugestões retornadas: {len(sugestoes)}")
        print("=== FIM BUSCAR_SUGESTOES ===\n")
        return JsonResponse({'sugestoes': sugestoes})
        
    except Exception as e:
        print(f"❌ ERRO em buscar_sugestoes: {e}")
        print("=== FIM BUSCAR_SUGESTOES (ERRO) ===\n")
        return JsonResponse({'sugestoes': [], 'erro': str(e)})


# Views do menu do usuário
@login_required(login_url='backstage:login')
def perfil(request, username=None):
    """Página de perfil do usuário"""
    if username:
        usuario_perfil = get_object_or_404(User, username=username)
    else:
        usuario_perfil = request.user
    
    # Buscar reviews do usuário
    criticas_filmes = Critica.objects.filter(usuario=usuario_perfil).select_related('filme')[:6]
    criticas_series = CriticaSerie.objects.filter(usuario=usuario_perfil).select_related('serie')[:6]
    
    # Buscar listas
    listas = Lista.objects.filter(usuario=usuario_perfil).prefetch_related('itens__filme')[:6]
    
    # Estatísticas
    total_filmes = Critica.objects.filter(usuario=usuario_perfil).count()
    total_series = CriticaSerie.objects.filter(usuario=usuario_perfil).count()
    total_listas = Lista.objects.filter(usuario=usuario_perfil).count()
    
    context = {
        'usuario_perfil': usuario_perfil,
        'criticas_filmes': criticas_filmes,
        'criticas_series': criticas_series,
        'listas': listas,
        'total_filmes': total_filmes,
        'total_series': total_series,
        'total_listas': total_listas,
        'is_own_profile': request.user == usuario_perfil,
    }
    
    return render(request, 'backstage/perfil.html', context)


@login_required(login_url='backstage:login')
def meu_diario(request):
    """Página do diário do usuário com atividades recentes"""
    criticas_recentes = Critica.objects.filter(usuario=request.user).order_by('-data_criacao')[:20]
    criticas_series = CriticaSerie.objects.filter(usuario=request.user).order_by('-data_criacao')[:20]
    
    context = {
        'criticas_recentes': criticas_recentes,
        'criticas_series': criticas_series,
    }
    
    return render(request, 'backstage/meu_diario.html', context)


@login_required(login_url='backstage:login')
def reviews(request):
    """Página com todas as reviews do usuário"""
    criticas_filmes = Critica.objects.filter(usuario=request.user).select_related('filme').order_by('-data_criacao')
    criticas_series = CriticaSerie.objects.filter(usuario=request.user).select_related('serie').order_by('-data_criacao')
    
    context = {
        'criticas_filmes': criticas_filmes,
        'criticas_series': criticas_series,
    }
    
    return render(request, 'backstage/reviews.html', context)


@login_required(login_url='backstage:login')
def watchlist(request):
    """Página da watchlist (assistir mais tarde)"""
    try:
        lista_watchlist = Lista.objects.get(usuario=request.user, nome="Assistir mais tarde")
    except Lista.DoesNotExist:
        lista_watchlist = Lista.objects.create(
            usuario=request.user,
            nome="Assistir mais tarde",
            descricao="Filmes e séries para assistir mais tarde"
        )
    
    itens = lista_watchlist.itemlista_set.all().select_related('filme', 'serie')
    
    context = {
        'lista': lista_watchlist,
        'itens': itens,
    }
    
    return render(request, 'backstage/watchlist.html', context)


@login_required(login_url='backstage:login')
def favoritos(request):
    """Página de favoritos do usuário"""
    # Filmes com nota máxima
    filmes_favoritos = Critica.objects.filter(
        usuario=request.user,
        nota__gte=4.5
    ).select_related('filme').order_by('-nota')
    
    # Séries com nota máxima
    series_favoritas = CriticaSerie.objects.filter(
        usuario=request.user,
        nota__gte=4.5
    ).select_related('serie').order_by('-nota')
    
    context = {
        'filmes_favoritos': filmes_favoritos,
        'series_favoritas': series_favoritas,
    }
    
    return render(request, 'backstage/favoritos.html', context)


@login_required(login_url='backstage:login')
def configuracoes(request):
    """Página de configurações do usuário"""
    if request.method == 'POST':
        # Aqui você pode adicionar lógica para salvar configurações
        messages.success(request, 'Configurações salvas com sucesso!')
        return redirect('backstage:configuracoes')
    
    return render(request, 'backstage/configuracoes.html')


def ajuda(request):
    """Página de ajuda"""
    return render(request, 'backstage/ajuda.html')


@login_required(login_url='backstage:login')
@login_required(login_url='backstage:login')
def amigos(request):
    """Página de amigos"""
    usuario = request.user
    
    # Buscar amigos do usuário
    amizades = Amizade.objects.filter(
        Q(usuario1=usuario) | Q(usuario2=usuario)
    )
    
    # Extrair lista de amigos
    amigos_list = []
    for amizade in amizades:
        amigo = amizade.usuario2 if amizade.usuario1 == usuario else amizade.usuario1
        # Contar reviews do amigo
        criticas_count = Critica.objects.filter(usuario=amigo).count()
        amigo.criticas_count = criticas_count
        amigos_list.append(amigo)
    
    # Buscar solicitações recebidas
    solicitacoes_recebidas = SolicitacaoAmizade.objects.filter(
        destinatario=usuario,
        status='pending'
    ).select_related('remetente').order_by('-data_criacao')
    
    # Buscar solicitações enviadas
    solicitacoes_enviadas = SolicitacaoAmizade.objects.filter(
        remetente=usuario,
        status='pending'
    ).select_related('destinatario').order_by('-data_criacao')
    
    context = {
        'amigos': amigos_list,
        'amigos_count': len(amigos_list),
        'solicitacoes_recebidas': solicitacoes_recebidas,
        'solicitacoes_enviadas': solicitacoes_enviadas,
        'solicitacoes_pendentes_count': solicitacoes_recebidas.count(),
    }
    
    return render(request, 'backstage/amigos.html', context)



# ============================================================================
# VIEWS DE DIÁRIO
# ============================================================================

@login_required(login_url='backstage:login')
def diary(request):
    """Página principal do diário de filmes"""
    from datetime import datetime
    from collections import Counter
    
    usuario = request.user
    hoje = datetime.now()
    
    # Buscar todas as entradas do diário do usuário
    entradas = DiarioFilme.objects.filter(usuario=usuario).select_related('filme')
    
    # Estatísticas
    total_filmes = entradas.count()
    filmes_mes = entradas.filter(
        data_assistido__year=hoje.year,
        data_assistido__month=hoje.month
    ).count()
    
    # Gênero favorito (se tiver categorias no modelo Filme)
    generos = []
    for entrada in entradas:
        if entrada.filme.categoria:
            # categoria pode ser "Action, Drama, Thriller" - separar em lista
            cats = [g.strip() for g in entrada.filme.categoria.split(',') if g.strip()]
            generos.extend(cats)
    
    genero_favorito = None
    if generos:
        counter = Counter(generos)
        genero_favorito = counter.most_common(1)[0][0]
    
    # Contadores de gênero e avaliação para os filtros
    genre_counts = Counter(generos)
    rating_counts = Counter([entrada.nota for entrada in entradas])
    
    context = {
        'total_filmes': total_filmes,
        'filmes_mes': filmes_mes,
        'genero_favorito': genero_favorito,
        'mes_atual': hoje.strftime('%B %Y'),
        'genre_counts': dict(genre_counts),
        'rating_counts': dict(rating_counts),
    }
    
    return render(request, 'backstage/diary.html', context)


@api_login_required
def diario_entradas(request):
    """API para buscar entradas do diário"""
    from datetime import datetime
    
    usuario = request.user
    ano = request.GET.get('ano')
    mes = request.GET.get('mes')
    
    print(f"\n=== DIÁRIO ENTRADAS - Usuário: {usuario.username} ===")
    
    # Filtrar entradas
    entradas = DiarioFilme.objects.filter(usuario=usuario).select_related('filme')
    
    if ano and mes:
        entradas = entradas.filter(
            data_assistido__year=int(ano),
            data_assistido__month=int(mes)
        )
    
    print(f"Total de entradas encontradas: {entradas.count()}")
    
    # Preparar dados
    entradas_data = []
    for entrada in entradas:
        filme = entrada.filme
        print(f"\nProcessando entrada ID {entrada.id}:")
        print(f"  - Filme ID: {filme.id}")
        print(f"  - TMDb ID: {filme.tmdb_id}")
        print(f"  - Título atual: '{filme.titulo}'")
        print(f"  - Poster: {filme.poster}")
        
        # Se o filme não tem título, buscar do TMDb (usando nosso payload normalizado)
        if not filme.titulo and filme.tmdb_id:
            print(f"  ⚠️  Filme sem título, buscando do TMDb...")
            try:
                detalhes = obter_detalhes_com_cache(filme.tmdb_id)
                if detalhes and isinstance(detalhes, dict):
                    # Atualizar o filme com os dados normalizados do TMDb
                    filme.titulo = detalhes.get('titulo') or detalhes.get('title') or 'Sem título'
                    filme.descricao = detalhes.get('sinopse') or detalhes.get('overview') or ''
                    if detalhes.get('poster_path'):
                        filme.poster = f"https://image.tmdb.org/t/p/w500{detalhes.get('poster_path')}"
                    if detalhes.get('data_lancamento') or detalhes.get('release_date'):
                        filme.data_lancamento = detalhes.get('data_lancamento') or detalhes.get('release_date')
                    filme.save()
                    print(f"  ✓ Filme atualizado: {filme.titulo}")
            except Exception as e:
                print(f"  ✗ Erro ao buscar detalhes: {e}")
        
        titulo_final = filme.titulo or 'Sem título'
        print(f"  → Título final: '{titulo_final}'")
        
        entradas_data.append({
            'id': entrada.id,
            'filme_id': filme.tmdb_id or filme.id,
            'titulo': titulo_final,
            'poster': filme.poster or '/static/images/no-poster.png',
            'ano': entrada.data_assistido.year,
            'mes': entrada.data_assistido.month,
            'dia': entrada.data_assistido.day,
            'nota': entrada.nota,
            'assistido_com': entrada.assistido_com or '',
        })
    
    print(f"\n✓ Retornando {len(entradas_data)} entradas")
    return JsonResponse({'success': True, 'entradas': entradas_data})


@api_login_required
@require_http_methods(['POST'])
def diario_adicionar(request):
    """API para adicionar filme ao diário"""
    from datetime import datetime
    
    try:
        data = json.loads(request.body)
        filme_id = data.get('filme_id')
        data_assistido = data.get('data')
        nota = data.get('nota')
        assistido_com = data.get('assistido_com', '')
        
        if not filme_id or not data_assistido or not nota:
            return JsonResponse({
                'success': False,
                'message': 'Dados incompletos'
            })
        
        # Buscar ou criar o filme
        filme = None
        try:
            # Tentar buscar pelo TMDB ID
            filme = Filme.objects.get(tmdb_id=filme_id)
        except Filme.DoesNotExist:
            # Se não encontrar, buscar os detalhes do TMDB (payload normalizado) e criar
            detalhes = obter_detalhes_com_cache(filme_id)
            if detalhes and isinstance(detalhes, dict):
                # generos já vem como lista de strings ['Action', 'Drama'], não como dicts
                generos = detalhes.get('generos', []) or []
                generos_str = ', '.join(generos[:3]) if generos else ''
                
                filme = Filme.objects.create(
                    tmdb_id=filme_id,
                    titulo=detalhes.get('titulo') or detalhes.get('title') or 'Sem título',
                    descricao=detalhes.get('sinopse') or detalhes.get('overview') or '',
                    data_lancamento=(detalhes.get('data_lancamento') or detalhes.get('release_date')) or None,
                    poster=f"https://image.tmdb.org/t/p/w500{detalhes.get('poster_path')}" if detalhes.get('poster_path') else None,
                    categoria=generos_str
                )

        # Se encontrou um Filme existente mas sem título, tentar completar agora
        if filme and (not filme.titulo) and filme.tmdb_id:
            try:
                detalhes = obter_detalhes_com_cache(filme.tmdb_id)
                if detalhes and isinstance(detalhes, dict):
                    filme.titulo = detalhes.get('titulo') or detalhes.get('title') or filme.titulo or 'Sem título'
                    if not filme.descricao:
                        filme.descricao = detalhes.get('sinopse') or detalhes.get('overview') or ''
                    if not filme.poster and detalhes.get('poster_path'):
                        filme.poster = f"https://image.tmdb.org/t/p/w500{detalhes.get('poster_path')}"
                    if not filme.data_lancamento and (detalhes.get('data_lancamento') or detalhes.get('release_date')):
                        filme.data_lancamento = detalhes.get('data_lancamento') or detalhes.get('release_date')
                    filme.save()
            except Exception as e:
                print(f"[diario_adicionar] Falha ao completar dados do filme {filme.tmdb_id}: {e}")
        
        if not filme:
            return JsonResponse({
                'success': False,
                'message': 'Filme não encontrado'
            })
        
        # Converter string de data para objeto date
        data_obj = datetime.strptime(data_assistido, '%Y-%m-%d').date()
        
        # Criar ou atualizar entrada do diário
        entrada, created = DiarioFilme.objects.update_or_create(
            usuario=request.user,
            filme=filme,
            data_assistido=data_obj,
            defaults={
                'nota': nota,
                'assistido_com': assistido_com
            }
        )
        
        return JsonResponse({
            'success': True,
            'message': 'Filme adicionado ao diário!' if created else 'Entrada atualizada!',
            'entrada_id': entrada.id
        })
    
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Erro ao adicionar filme: {str(e)}'
        })


@api_login_required
@require_http_methods(['POST'])
def diario_remover(request, entrada_id):
    """API para remover entrada do diário"""
    try:
        entrada = get_object_or_404(
            DiarioFilme,
            id=entrada_id,
            usuario=request.user
        )
        
        entrada.delete()
        
        return JsonResponse({
            'success': True,
            'message': 'Entrada removida do diário'
        })
    
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': str(e)
        })


# ==================== FRIENDSHIP SYSTEM ====================

@api_login_required
@require_http_methods(['GET'])
def buscar_usuarios_realtime(request):
    """API para busca em tempo real de usuários"""
    try:
        query = request.GET.get('q', '').strip()
        
        # Mínimo de 2 caracteres para buscar
        if len(query) < 2:
            return JsonResponse({
                'success': True,
                'usuarios': []
            })
        
        # Buscar usuários (exceto o usuário atual)
        usuarios = User.objects.filter(
            Q(username__icontains=query) |
            Q(first_name__icontains=query) |
            Q(last_name__icontains=query)
        ).exclude(id=request.user.id)[:10]  # Limitar a 10 resultados
        
        resultados = []
        for usuario in usuarios:
            # Verificar status de amizade
            ja_amigo = Amizade.objects.filter(
                Q(usuario1=request.user, usuario2=usuario) |
                Q(usuario1=usuario, usuario2=request.user)
            ).exists()
            
            if ja_amigo:
                status = 'amigo'
                status_text = 'Amigo'
            else:
                # Verificar solicitação pendente
                solicitacao_enviada = SolicitacaoAmizade.objects.filter(
                    remetente=request.user,
                    destinatario=usuario,
                    status='pending'
                ).exists()
                
                solicitacao_recebida = SolicitacaoAmizade.objects.filter(
                    remetente=usuario,
                    destinatario=request.user,
                    status='pending'
                ).exists()
                
                if solicitacao_enviada:
                    status = 'pendente_enviada'
                    status_text = 'Solicitação enviada'
                elif solicitacao_recebida:
                    status = 'pendente_recebida'
                    status_text = 'Aceitar solicitação'
                else:
                    status = 'adicionar'
                    status_text = 'Adicionar amigo'
            
            # Obter foto de perfil (se existir)
            foto_perfil = None
            if hasattr(usuario, 'profile') and hasattr(usuario.profile, 'foto_perfil'):
                if usuario.profile.foto_perfil:
                    foto_perfil = usuario.profile.foto_perfil.url
            
            resultados.append({
                'id': usuario.id,
                'username': usuario.username,
                'nome': usuario.get_full_name() or usuario.username,
                'foto_perfil': foto_perfil,
                'status': status,
                'status_text': status_text
            })
        
        return JsonResponse({
            'success': True,
            'usuarios': resultados
        })
    
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Erro ao buscar usuários: {str(e)}'
        })


@api_login_required
@require_http_methods(['POST'])
def enviar_solicitacao(request):
    """API para enviar solicitação de amizade"""
    try:
        data = json.loads(request.body)
        destinatario_id = data.get('destinatario_id')
        
        if not destinatario_id:
            return JsonResponse({
                'success': False,
                'message': 'ID do destinatário não fornecido'
            })
        
        destinatario = get_object_or_404(User, id=destinatario_id)
        
        # Verificar se já são amigos
        ja_amigo = Amizade.objects.filter(
            Q(usuario1=request.user, usuario2=destinatario) |
            Q(usuario1=destinatario, usuario2=request.user)
        ).exists()
        
        if ja_amigo:
            return JsonResponse({
                'success': False,
                'message': 'Vocês já são amigos'
            })
        
        # Verificar se já existe solicitação pendente
        solicitacao_existente = SolicitacaoAmizade.objects.filter(
            Q(remetente=request.user, destinatario=destinatario) |
            Q(remetente=destinatario, destinatario=request.user),
            status='pending'
        ).first()
        
        if solicitacao_existente:
            return JsonResponse({
                'success': False,
                'message': 'Já existe uma solicitação pendente'
            })
        
        # Criar solicitação
        SolicitacaoAmizade.objects.create(
            remetente=request.user,
            destinatario=destinatario
        )
        
        return JsonResponse({
            'success': True,
            'message': 'Solicitação enviada com sucesso!'
        })
    
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Erro ao enviar solicitação: {str(e)}'
        })


@api_login_required
@require_http_methods(['POST'])
def aceitar_solicitacao(request):
    """API para aceitar solicitação de amizade"""
    try:
        data = json.loads(request.body)
        solicitacao_id = data.get('solicitacao_id')
        
        if not solicitacao_id:
            return JsonResponse({
                'success': False,
                'message': 'ID da solicitação não fornecido'
            })
        
        solicitacao = get_object_or_404(
            SolicitacaoAmizade,
            id=solicitacao_id,
            destinatario=request.user,
            status='pending'
        )
        
        # Criar amizade
        Amizade.objects.create(
            usuario1=solicitacao.remetente,
            usuario2=request.user
        )
        
        # Atualizar status da solicitação
        solicitacao.status = 'accepted'
        solicitacao.save()
        
        return JsonResponse({
            'success': True,
            'message': 'Solicitação aceita!'
        })
    
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Erro ao aceitar solicitação: {str(e)}'
        })


@api_login_required
@require_http_methods(['POST'])
def rejeitar_solicitacao(request):
    """API para rejeitar solicitação de amizade"""
    try:
        data = json.loads(request.body)
        solicitacao_id = data.get('solicitacao_id')
        
        if not solicitacao_id:
            return JsonResponse({
                'success': False,
                'message': 'ID da solicitação não fornecido'
            })
        
        solicitacao = get_object_or_404(
            SolicitacaoAmizade,
            id=solicitacao_id,
            destinatario=request.user,
            status='pending'
        )
        
        # Atualizar status da solicitação
        solicitacao.status = 'rejected'
        solicitacao.save()
        
        return JsonResponse({
            'success': True,
            'message': 'Solicitação rejeitada'
        })
    
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Erro ao rejeitar solicitação: {str(e)}'
        })


@api_login_required
@require_http_methods(['POST'])
def cancelar_solicitacao(request):
    """API para cancelar solicitação de amizade enviada"""
    try:
        data = json.loads(request.body)
        solicitacao_id = data.get('solicitacao_id')
        
        if not solicitacao_id:
            return JsonResponse({
                'success': False,
                'message': 'ID da solicitação não fornecido'
            })
        
        solicitacao = get_object_or_404(
            SolicitacaoAmizade,
            id=solicitacao_id,
            remetente=request.user,
            status='pending'
        )
        
        # Deletar solicitação
        solicitacao.delete()
        
        return JsonResponse({
            'success': True,
            'message': 'Solicitação cancelada'
        })
    
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Erro ao cancelar solicitação: {str(e)}'
        })


@api_login_required
@require_http_methods(['POST'])
def remover_amigo(request):
    """API para remover amizade"""
    try:
        data = json.loads(request.body)
        amigo_id = data.get('amigo_id')
        
        if not amigo_id:
            return JsonResponse({
                'success': False,
                'message': 'ID do amigo não fornecido'
            })
        
        amigo = get_object_or_404(User, id=amigo_id)
        
        # Buscar e deletar amizade
        amizade = Amizade.objects.filter(
            Q(usuario1=request.user, usuario2=amigo) |
            Q(usuario1=amigo, usuario2=request.user)
        ).first()
        
        if not amizade:
            return JsonResponse({
                'success': False,
                'message': 'Amizade não encontrada'
            })
        
        amizade.delete()
        
        return JsonResponse({
            'success': True,
            'message': 'Amigo removido'
        })
    
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Erro ao remover amigo: {str(e)}'
        })
