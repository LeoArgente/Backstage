import json
import requests
import random
from urllib import request, parse
from datetime import datetime, timedelta, timezone
from django.conf import settings
from ..models import FilmeCache

def _get(endpoint, params=None, max_retries=3, timeout=10):
    """
    Faz requisição à API do TMDb com retry e timeout

    Args:
        endpoint: Endpoint da API (ex: /movie/123)
        params: Parâmetros da query string
        max_retries: Número máximo de tentativas em caso de erro
        timeout: Timeout em segundos para cada requisição
    """
    params = params or {}
    params["api_key"] = settings.TMDB_API_KEY
    url = f"{settings.TMDB_BASE_URL}{endpoint}?{parse.urlencode(params)}"

    last_error = None

    for attempt in range(max_retries):
        try:
            # Usar timeout para evitar requisições travadas
            with request.urlopen(url, timeout=timeout) as resp:
                if resp.status != 200:
                    raise Exception(f"Erro TMDb: status {resp.status}")
                return json.load(resp)

        except Exception as e:
            last_error = e

            # Se não for a última tentativa, aguardar antes de tentar novamente
            if attempt < max_retries - 1:
                import time
                wait_time = (attempt + 1) * 0.5  # Espera progressiva: 0.5s, 1s, 1.5s
                print(f"Tentativa {attempt + 1}/{max_retries} falhou para {endpoint}. Tentando novamente em {wait_time}s...")
                time.sleep(wait_time)
            else:
                # Última tentativa falhou
                print(f"Todas as {max_retries} tentativas falharam para {endpoint}: {str(e)}")

    # Se chegou aqui, todas as tentativas falharam
    raise Exception(f"Falha ao buscar dados da API TMDb após {max_retries} tentativas: {str(last_error)}")

def buscar_detalhes_filme(id_tmdb: int):
    return _get(f"/movie/{id_tmdb}", params={"language": "pt-BR"})

def buscar_creditos(id_tmdb: int):
    return _get(f"/movie/{id_tmdb}/credits", params={"language": "pt-BR"})

def buscar_plataformas(id_tmdb: int, region: str):
    data = _get(f"/movie/{id_tmdb}/watch/providers")
    return data.get("results", {}).get(region, {})

def buscar_filmes_populares(page=1):
    data = _get("/movie/popular", params={"language": "pt-BR", "page": page})
    filmes = data.get("results", [])
    # Padroniza os campos para o template
    return [{
        'tmdb_id': filme.get('id'),
        'titulo': filme.get('title'),
        'sinopse': filme.get('overview'),
        'poster_path': filme.get('poster_path'),
        'backdrop_path': filme.get('backdrop_path'),
        'ano_lancamento': filme.get('release_date', '')[:4] if filme.get('release_date') else '',
        'nota_tmdb': filme.get('vote_average')
    } for filme in filmes]

def buscar_filmes_em_cartaz(page=1):
    data = _get("/movie/now_playing", params={"language": "pt-BR", "page": page, "region": "BR"})
    filmes = data.get("results", [])
    # Padroniza os campos
    return [{
        'tmdb_id': filme.get('id'),
        'titulo': filme.get('title'),
        'sinopse': filme.get('overview'),
        'poster_path': filme.get('poster_path'),
        'backdrop_path': filme.get('backdrop_path'),
        'ano_lancamento': filme.get('release_date', '')[:4] if filme.get('release_date') else '',
        'nota_tmdb': filme.get('vote_average')
    } for filme in filmes]

'''

'''

def buscar_filme_por_titulo(query, page=1):
    data = _get("/search/movie", params={"language": "pt-BR", "query": query, "page": page})
    filmes = data.get("results", [])
    # Padroniza os campos
    return [{
        'tmdb_id': filme.get('id'),
        'titulo': filme.get('title'),
        'sinopse': filme.get('overview'),
        'poster_path': filme.get('poster_path'),
        'backdrop_path': filme.get('backdrop_path'),
        'ano_lancamento': filme.get('release_date', '')[:4] if filme.get('release_date') else '',
        'nota_tmdb': filme.get('vote_average')
    } for filme in filmes]

def buscar_pessoa_por_nome(query, page=1):
    """Busca pessoas (atores, diretores) por nome"""
    data = _get("/search/person", params={"language": "pt-BR", "query": query, "page": page})
    return data.get("results", [])

def buscar_filmes_por_pessoa(person_id):
    """Busca filmes de uma pessoa específica"""
    data = _get(f"/person/{person_id}/movie_credits", params={"language": "pt-BR"})
    filmes = data.get("cast", []) + data.get("crew", [])
    
    # Remover duplicatas e padronizar
    filmes_unicos = {}
    for filme in filmes:
        if filme.get('id') not in filmes_unicos:
            filmes_unicos[filme.get('id')] = {
                'tmdb_id': filme.get('id'),
                'titulo': filme.get('title'),
                'sinopse': filme.get('overview'),
                'poster_path': filme.get('poster_path'),
                'backdrop_path': filme.get('backdrop_path'),
                'ano_lancamento': filme.get('release_date', '')[:4] if filme.get('release_date') else '',
                'nota_tmdb': filme.get('vote_average', 0)
            }
    
    return list(filmes_unicos.values())

def buscar_generos():
    """Retorna lista de gêneros de filmes"""
    data = _get("/genre/movie/list", params={"language": "pt-BR"})
    return data.get("genres", [])

def buscar_filmes_por_genero(genre_id, page=1):
    """Busca filmes por gênero"""
    data = _get("/discover/movie", params={
        "language": "pt-BR",
        "with_genres": genre_id,
        "page": page,
        "sort_by": "popularity.desc"
    })
    filmes = data.get("results", [])
    
    return [{
        'tmdb_id': filme.get('id'),
        'titulo': filme.get('title'),
        'sinopse': filme.get('overview'),
        'poster_path': filme.get('poster_path'),
        'backdrop_path': filme.get('backdrop_path'),
        'ano_lancamento': filme.get('release_date', '')[:4] if filme.get('release_date') else '',
        'nota_tmdb': filme.get('vote_average')
    } for filme in filmes]

def buscar_filme_destaque():
    # Busca filmes em cartaz e retorna um aleatório
    filmes = buscar_filmes_em_cartaz()
    if filmes:
        import random
        # Filtra filmes que têm tanto backdrop quanto poster
        filmes_com_imagens = [f for f in filmes[:10] if f.get('backdrop_path') and f.get('poster_path')]
        if not filmes_com_imagens:
            filmes_com_imagens = filmes[:5]  # Fallback se nenhum tiver ambas
        
        filme = random.choice(filmes_com_imagens)
        
        # Busca detalhes completos do filme para garantir que temos backdrop e poster corretos
        try:
            detalhes = buscar_detalhes_filme(filme['tmdb_id'])
            # Atualiza com dados completos
            filme['backdrop_path'] = detalhes.get('backdrop_path')
            filme['poster_path'] = detalhes.get('poster_path')
            filme['duracao_min'] = detalhes.get('runtime', 120)
            filme['sinopse'] = detalhes.get('overview', filme.get('sinopse', ''))
        except:
            filme['duracao_min'] = 120  # Valor padrão se falhar
        
        # Converter nota da escala 10 para escala 5 com 1 casa decimal
        if filme.get('nota_tmdb'):
            filme['nota_escala_5'] = round(filme['nota_tmdb'] / 2, 1)
        else:
            filme['nota_escala_5'] = 4.0  # Valor padrão
        
        print(f"DEBUG - Filme destaque: {filme['titulo']}")
        print(f"DEBUG - TMDB ID: {filme['tmdb_id']}")
        print(f"DEBUG - Backdrop: {filme.get('backdrop_path')}")
        print(f"DEBUG - Poster: {filme.get('poster_path')}")
        
        return filme
    return None

def buscar_series_populares(page=1):
    data = _get("/tv/popular", params={"language": "pt-BR", "page": page})
    series = data.get("results", [])
    # Padroniza os campos para séries
    return [{
        'tmdb_id': serie.get('id'),
        'titulo': serie.get('name'),
        'sinopse': serie.get('overview'),
        'poster_path': serie.get('poster_path'),
        'backdrop_path': serie.get('backdrop_path'),
        'ano_lancamento': serie.get('first_air_date', '')[:4] if serie.get('first_air_date') else '',
        'nota_tmdb': serie.get('vote_average')
    } for serie in series]

def buscar_filmes_por_filtros(genero_id=None, ordenacao='popular', page=1):
    """
    Busca filmes com filtros de gênero e ordenação
    genero_id: ID do gênero da TMDB (None para todos)
    ordenacao: 'popular', 'rating', 'recent', 'alphabetical'
    """
    params = {
        "language": "pt-BR",
        "page": page,
        "region": "BR"
    }

    # Adicionar filtro de gênero se especificado
    if genero_id:
        params["with_genres"] = genero_id

    # Definir endpoint e ordenação conforme tipo
    if ordenacao == 'rating':
        params["sort_by"] = "vote_average.desc"
        params["vote_count.gte"] = 100  # Filtrar filmes com pelo menos 100 votos
        endpoint = "/discover/movie"
    elif ordenacao == 'recent':
        params["sort_by"] = "release_date.desc"
        endpoint = "/discover/movie"
    elif ordenacao == 'alphabetical':
        params["sort_by"] = "title.asc"
        endpoint = "/discover/movie"
    else:  # popular (padrão)
        params["sort_by"] = "popularity.desc"
        endpoint = "/discover/movie"

    data = _get(endpoint, params=params)
    filmes = data.get("results", [])

    # Padronizar campos
    return [{
        'tmdb_id': filme.get('id'),
        'titulo': filme.get('title'),
        'sinopse': filme.get('overview'),
        'poster_path': filme.get('poster_path'),
        'backdrop_path': filme.get('backdrop_path'),
        'ano_lancamento': filme.get('release_date', '')[:4] if filme.get('release_date') else '',
        'nota_tmdb': filme.get('vote_average')
    } for filme in filmes]

def buscar_series_por_filtros(genero_id=None, ordenacao='popular', page=1):
    """
    Busca séries com filtros de gênero e ordenação
    genero_id: ID do gênero da TMDB (None para todos)
    ordenacao: 'popular', 'rating', 'recent', 'alphabetical'
    """
    params = {
        "language": "pt-BR",
        "page": page,
        "region": "BR"
    }

    # Adicionar filtro de gênero se especificado
    if genero_id:
        params["with_genres"] = genero_id

    # Definir endpoint e ordenação conforme tipo
    if ordenacao == 'rating':
        params["sort_by"] = "vote_average.desc"
        params["vote_count.gte"] = 100  # Filtrar séries com pelo menos 100 votos
        endpoint = "/discover/tv"
    elif ordenacao == 'recent':
        params["sort_by"] = "first_air_date.desc"
        endpoint = "/discover/tv"
    elif ordenacao == 'alphabetical':
        params["sort_by"] = "name.asc"
        endpoint = "/discover/tv"
    else:  # popular (padrão)
        params["sort_by"] = "popularity.desc"
        endpoint = "/discover/tv"

    data = _get(endpoint, params=params)
    series = data.get("results", [])

    # Padronizar campos
    return [{
        'tmdb_id': serie.get('id'),
        'titulo': serie.get('name'),
        'sinopse': serie.get('overview'),
        'poster_path': serie.get('poster_path'),
        'backdrop_path': serie.get('backdrop_path'),
        'ano_lancamento': serie.get('first_air_date', '')[:4] if serie.get('first_air_date') else '',
        'nota_tmdb': serie.get('vote_average')
    } for serie in series]

def montar_payload_agregado(id_tmdb: int, region: str = None):
    region = region or getattr(settings, "TMDB_DEFAULT_REGION", "BR")

    detalhes = buscar_detalhes_filme(id_tmdb)
    creditos = buscar_creditos(id_tmdb)
    provs = buscar_plataformas(id_tmdb, region)

    # Garantir que creditos sempre tenha os campos necessários, mesmo que vazios
    elenco = creditos.get("cast") if creditos else []
    if not elenco:
        elenco = []
    elenco_ordenado = sorted(elenco, key=lambda c: c.get("order", 999))[:10]

    # Extrair equipe (crew) principal - garantir que seja sempre uma lista
    equipe = creditos.get("crew") if creditos else []
    if not equipe:
        equipe = []

    plataformas = []
    if provs:
        for tipo in ("flatrate", "rent", "buy", "ads", "free"):
            items = provs.get(tipo, [])
            if items:
                for p in items:
                    plataformas.append({
                        "nome": p.get("provider_name"),
                        "logo_path": p.get("logo_path"),
                        "tipo": tipo
                    })

    # Retorna com campos padronizados - garantir que listas sejam sempre listas vazias, nunca None
    return {
        "tmdb_id": id_tmdb,
        "titulo": detalhes.get("title") or "Título não disponível",
        "titulo_original": detalhes.get("original_title") or "",
        "sinopse": detalhes.get("overview") or "",
        "poster_path": detalhes.get("poster_path"),
        "backdrop_path": detalhes.get("backdrop_path"),
        "ano_lancamento": detalhes.get("release_date", "")[:4] if detalhes.get("release_date") else "",
        "data_lancamento": detalhes.get("release_date"),
        "nota_tmdb": detalhes.get("vote_average"),
        "duracao_min": detalhes.get("runtime"),
        "generos": [genero.get("name") for genero in detalhes.get("genres", [])] if detalhes.get("genres") else [],
        "status": detalhes.get("status"),  # "Released", "Post Production", etc
        "idioma_original": detalhes.get("original_language"),  # "en", "pt", etc
        "orcamento": detalhes.get("budget", 0),
        "receita": detalhes.get("revenue", 0),
        "palavras_chave": [],  # Será preenchido com keywords da API se necessário
        "elenco_principal": [
            {
                "nome": p.get("name") or "Nome não disponível",
                "personagem": p.get("character") or "Personagem não disponível",
                "foto_path": p.get("profile_path")
            }
            for p in elenco_ordenado
        ],
        "equipe": equipe,  # Incluir crew completa para o JavaScript processar - sempre uma lista
        "plataformas": plataformas
    }

def obter_detalhes_com_cache(id_tmdb: int, ttl_minutos: int = 1440, region: str = None):
    """
    Busca detalhes do filme com cache. Trata race condition em requisições simultâneas.
    """
    from django.db import IntegrityError

    # Tenta usar cache até 'ttl_minutos' (default 24h). Se expirado, refaz na TMDb e atualiza.
    try:
        fc = FilmeCache.objects.get(id_tmdb=id_tmdb)
        if (datetime.now(timezone.utc) - fc.atualizado_em) < timedelta(minutes=ttl_minutos):
            return fc.payload
    except FilmeCache.DoesNotExist:
        fc = None

    try:
        payload = montar_payload_agregado(id_tmdb, region=region)
    except Exception as e:
        print(f"[ERRO] Falha ao buscar detalhes do filme {id_tmdb}: {e}")
        return None

    if fc:
        # Cache existe mas está expirado - atualizar
        fc.payload = payload
        fc.save(update_fields=["payload", "atualizado_em"])
    else:
        # Cache não existe - tentar criar
        try:
            FilmeCache.objects.create(id_tmdb=id_tmdb, payload=payload)
        except IntegrityError:
            # Outra requisição já criou o cache - buscar e retornar
            # Isso acontece quando múltiplas requisições chegam simultaneamente
            print(f"[INFO] Cache para filme {id_tmdb} já existe (criado por outra requisição)")
            try:
                fc = FilmeCache.objects.get(id_tmdb=id_tmdb)
                return fc.payload
            except FilmeCache.DoesNotExist:
                # Caso extremamente raro - retornar o payload que acabamos de buscar
                pass

    return payload

def converter_para_estrelas(nota_tmdb):
    """Converte nota TMDb (0-10) para escala de 5 estrelas com meia estrela"""
    if not nota_tmdb:
        return 0
    estrelas = nota_tmdb / 2
    # Arredondar para meia estrela mais próxima
    return round(estrelas * 2) / 2

def formatar_duracao(minutos):
    """Converte minutos para formato 'Xh Ymin'"""
    if not minutos:
        return ""
    horas = minutos // 60
    mins = minutos % 60
    if horas > 0:
        return f"{horas}h {mins}min" if mins > 0 else f"{horas}h"
    return f"{mins}min"

def obter_top_filmes(limit=5, usar_cache=True):
    """Busca os filmes mais bem avaliados para a Hero Section"""
    cache_key = f"top_rated_{limit}"

    if usar_cache:
        try:
            fc = FilmeCache.objects.filter(id_tmdb=999999).first()
            if fc and fc.payload.get('cache_type') == cache_key:
                if (datetime.now(timezone.utc) - fc.atualizado_em) < timedelta(hours=6):
                    return fc.payload.get('filmes', [])
        except:
            pass

    # Buscar da API
    data = _get("/movie/top_rated", params={"language": "pt-BR", "page": 1})
    filmes = data.get("results", [])[:limit]

    # Formatar para Hero Section
    hero_movies = []
    for filme in filmes:
        # Buscar detalhes completos para ter duração
        try:
            detalhes = buscar_detalhes_filme(filme['id'])
            duracao = detalhes.get('runtime')
        except:
            duracao = None

        hero_movies.append({
            'tmdb_id': filme.get('id'),
            'titulo': filme.get('title'),
            'ano': filme.get('release_date', '')[:4] if filme.get('release_date') else '',
            'duracao': formatar_duracao(duracao),
            'nota': filme.get('vote_average', 0),
            'nota_estrelas': converter_para_estrelas(filme.get('vote_average', 0)),
            'poster_path': filme.get('poster_path'),
            'backdrop_path': filme.get('backdrop_path'),
            'sinopse': filme.get('overview', '')
        })

    # Salvar no cache
    if usar_cache and hero_movies:
        cache_payload = {
            'cache_type': cache_key,
            'filmes': hero_movies
        }
        FilmeCache.objects.update_or_create(
            id_tmdb=999999,
            defaults={'payload': cache_payload}
        )

    return hero_movies

def obter_trending(limit=20, usar_cache=True):
    """Busca filmes em tendência (trending da semana)"""
    cache_key = f"trending_{limit}"

    if usar_cache:
        try:
            fc = FilmeCache.objects.filter(id_tmdb=999998).first()
            if fc and fc.payload.get('cache_type') == cache_key:
                if (datetime.now(timezone.utc) - fc.atualizado_em) < timedelta(hours=1):
                    return fc.payload.get('filmes', [])
        except:
            pass

    # Buscar da API
    data = _get("/trending/movie/week", params={"language": "pt-BR"})
    filmes = data.get("results", [])[:limit]

    # Formatar
    trending_movies = []
    for filme in filmes:
        # Buscar detalhes do filme para obter duração e gêneros
        duracao_formatada = ""
        generos = []
        try:
            detalhes = buscar_detalhes_filme(filme.get('id'))
            duracao_min = detalhes.get('runtime')
            duracao_formatada = formatar_duracao(duracao_min)
            generos = [g['name'] for g in detalhes.get('genres', [])]
        except:
            pass

        trending_movies.append({
            'tmdb_id': filme.get('id'),
            'titulo': filme.get('title'),
            'ano': filme.get('release_date', '')[:4] if filme.get('release_date') else '',
            'nota': filme.get('vote_average', 0),
            'nota_estrelas': converter_para_estrelas(filme.get('vote_average', 0)),
            'poster_path': filme.get('poster_path'),
            'backdrop_path': filme.get('backdrop_path'),
            'sinopse': filme.get('overview', ''),
            'generos': generos,
            'duracao': duracao_formatada
        })

    # Salvar no cache
    if usar_cache and trending_movies:
        cache_payload = {
            'cache_type': cache_key,
            'filmes': trending_movies
        }
        FilmeCache.objects.update_or_create(
            id_tmdb=999998,
            defaults={'payload': cache_payload}
        )

    return trending_movies

def obter_recomendados(limit=12, usar_cache=True, usuario=None):
    """Busca filmes recomendados personalizados baseados no histórico do usuário"""
    
    print(f"[DEBUG obter_recomendados] usuario={usuario}, is_authenticated={usuario.is_authenticated if usuario else 'N/A'}")
    
    # Se o usuário estiver autenticado, fazer recomendações personalizadas
    if usuario and usuario.is_authenticated:
        try:
            from backstage.models import DiarioFilme, Critica, Filme
            from django.db.models import Count, Avg
            
            # Buscar gêneros favoritos do usuário baseado no diário e críticas
            filmes_assistidos_ids = DiarioFilme.objects.filter(usuario=usuario).values_list('filme__tmdb_id', flat=True)
            criticas_usuario = Critica.objects.filter(usuario=usuario, nota__gte=4).values_list('filme__tmdb_id', flat=True)
            
            # Combinar filmes do diário e bem avaliados
            filmes_relevantes_ids = list(set(list(filmes_assistidos_ids) + list(criticas_usuario)))
            
            print(f"[DEBUG obter_recomendados] Filmes relevantes encontrados: {len(filmes_relevantes_ids)}")
            
            if filmes_relevantes_ids:
                # Buscar gêneros mais comuns nos filmes que o usuário gostou
                filmes_relevantes = Filme.objects.filter(tmdb_id__in=filmes_relevantes_ids)
                generos_contagem = {}
                
                for filme in filmes_relevantes:
                    if filme.generos:
                        # Gêneros podem estar como string separada por vírgula
                        generos_lista = [g.strip() for g in filme.generos.split(',')]
                        for genero in generos_lista:
                            generos_contagem[genero] = generos_contagem.get(genero, 0) + 1
                
                # Pegar top 3 gêneros favoritos
                generos_favoritos = sorted(generos_contagem.items(), key=lambda x: x[1], reverse=True)[:3]
                
                print(f"[DEBUG obter_recomendados] Gêneros favoritos: {generos_favoritos}")
                
                if generos_favoritos:
                    # Mapear nomes de gêneros para IDs do TMDb
                    generos_map = {
                        'Action': 28, 'Adventure': 12, 'Animation': 16,
                        'Comedy': 35, 'Crime': 80, 'Documentary': 99,
                        'Drama': 18, 'Family': 10751, 'Fantasy': 14,
                        'History': 36, 'Horror': 27, 'Music': 10402,
                        'Mystery': 9648, 'Romance': 10749, 'Science Fiction': 878,
                        'TV Movie': 10770, 'Thriller': 53, 'War': 10752,
                        'Western': 37
                    }
                    
                    # Buscar filmes com os gêneros favoritos
                    filmes_recomendados = []
                    for genero_nome, _ in generos_favoritos:
                        genero_id = generos_map.get(genero_nome)
                        if genero_id:
                            try:
                                data = _get("/discover/movie", params={
                                    "language": "pt-BR",
                                    "page": 1,
                                    "with_genres": genero_id,
                                    "vote_average.gte": 7,
                                    "sort_by": "vote_count.desc"
                                })
                                filmes_recomendados.extend(data.get("results", []))
                            except:
                                pass
                    
                    # Remover filmes já assistidos e duplicatas
                    filmes_unicos = {}
                    for filme in filmes_recomendados:
                        filme_id = filme.get('id')
                        if filme_id not in filmes_relevantes_ids and filme_id not in filmes_unicos:
                            filmes_unicos[filme_id] = filme
                    
                    # Pegar os mais votados
                    filmes_finais = sorted(
                        filmes_unicos.values(),
                        key=lambda x: x.get('vote_count', 0),
                        reverse=True
                    )[:limit]
                    
                    print(f"[DEBUG obter_recomendados] Filmes finais encontrados: {len(filmes_finais)}")
                    
                    if filmes_finais:
                        # Formatar recomendações personalizadas
                        recommended_movies = []
                        for filme in filmes_finais:
                            recommended_movies.append({
                                'tmdb_id': filme.get('id'),
                                'titulo': filme.get('title'),
                                'ano': filme.get('release_date', '')[:4] if filme.get('release_date') else '',
                                'nota': filme.get('vote_average', 0),
                                'nota_estrelas': converter_para_estrelas(filme.get('vote_average', 0)),
                                'poster_path': filme.get('poster_path'),
                                'backdrop_path': filme.get('backdrop_path'),
                                'sinopse': filme.get('overview', ''),
                                'generos': []
                            })
                        
                        return recommended_movies
        except Exception as e:
            print(f"[ERROR obter_recomendados] Erro na personalização: {str(e)}")
            import traceback
            traceback.print_exc()
    
    # Fallback: recomendações genéricas se não houver histórico suficiente ou usuário não autenticado
    print("[DEBUG] Usando fallback genérico para recomendações")
    cache_key = f"recommended_{limit}"

    if usar_cache:
        try:
            from backstage.models import FilmeCache
            fc = FilmeCache.objects.filter(id_tmdb=999997).first()
            if fc and fc.payload.get('cache_type') == cache_key:
                if (datetime.now(timezone.utc) - fc.atualizado_em) < timedelta(hours=3):
                    return fc.payload.get('filmes', [])
        except:
            pass

    # Buscar filmes populares
    data = _get("/movie/popular", params={"language": "pt-BR", "page": 1})
    # Filtrar apenas filmes com nota >= 7
    filmes = [f for f in data.get("results", []) if f.get('vote_average', 0) >= 7][:limit]

    # Formatar
    recommended_movies = []
    for filme in filmes:
        recommended_movies.append({
            'tmdb_id': filme.get('id'),
            'titulo': filme.get('title'),
            'ano': filme.get('release_date', '')[:4] if filme.get('release_date') else '',
            'nota': filme.get('vote_average', 0),
            'nota_estrelas': converter_para_estrelas(filme.get('vote_average', 0)),
            'poster_path': filme.get('poster_path'),
            'backdrop_path': filme.get('backdrop_path'),
            'sinopse': filme.get('overview', ''),
            'generos': []
        })

    # Salvar no cache
    if usar_cache and recommended_movies:
        try:
            from backstage.models import FilmeCache
            cache_payload = {
                'cache_type': cache_key,
                'filmes': recommended_movies
            }
            FilmeCache.objects.update_or_create(
                id_tmdb=999997,
                defaults={'payload': cache_payload}
            )
        except:
            pass

    return recommended_movies

def obter_goats(limit=20, usar_cache=True):
    """Busca filmes GOATS (Greatest of All Time) - os com as maiores notas da história"""
    cache_key = f"goats_{limit}"

    if usar_cache:
        try:
            fc = FilmeCache.objects.filter(id_tmdb=999996).first()
            if fc and fc.payload.get('cache_type') == cache_key:
                if (datetime.now(timezone.utc) - fc.atualizado_em) < timedelta(hours=12):
                    return fc.payload.get('filmes', [])
        except:
            pass

    # Buscar filmes com melhor avaliação (top rated) com filtro mais rigoroso
    goats_movies = []

    # Buscar múltiplas páginas para ter mais opções
    for page in range(1, 4):  # Buscar 3 páginas
        try:
            data = _get("/movie/top_rated", params={"language": "pt-BR", "page": page})
            filmes = data.get("results", [])

            # Filtrar apenas filmes com nota muito alta (>= 8.0) e quantidade significativa de votos
            filmes_filtrados = [
                f for f in filmes
                if f.get('vote_average', 0) >= 8.0 and f.get('vote_count', 0) >= 1000
            ]

            for filme in filmes_filtrados:
                if len(goats_movies) >= limit:
                    break

                goats_movies.append({
                    'tmdb_id': filme.get('id'),
                    'titulo': filme.get('title'),
                    'ano': filme.get('release_date', '')[:4] if filme.get('release_date') else '',
                    'nota': filme.get('vote_average', 0),
                    'nota_estrelas': converter_para_estrelas(filme.get('vote_average', 0)),
                    'poster_path': filme.get('poster_path'),
                    'backdrop_path': filme.get('backdrop_path'),
                    'sinopse': filme.get('overview', ''),
                    'votos': filme.get('vote_count', 0),
                    'generos': []
                })

            if len(goats_movies) >= limit:
                break

        except Exception as e:
            print(f"Erro ao buscar página {page} de GOATS: {e}")
            continue

    # Ordenar por nota (decrescente) e depois por número de votos
    goats_movies.sort(key=lambda x: (x['nota'], x['votos']), reverse=True)
    goats_movies = goats_movies[:limit]

    # Salvar no cache
    if usar_cache and goats_movies:
        cache_payload = {
            'cache_type': cache_key,
            'filmes': goats_movies
        }
        FilmeCache.objects.update_or_create(
            id_tmdb=999996,
            defaults={'payload': cache_payload}
        )

    return goats_movies

def obter_em_cartaz(limit=12, usar_cache=True):
    """Busca filmes em cartaz nos cinemas"""
    cache_key = f"now_playing_{limit}"

    if usar_cache:
        try:
            fc = FilmeCache.objects.filter(id_tmdb=999995).first()
            if fc and fc.payload.get('cache_type') == cache_key:
                if (datetime.now(timezone.utc) - fc.atualizado_em) < timedelta(hours=6):
                    return fc.payload.get('filmes', [])
        except:
            pass

    # Buscar filmes em cartaz
    data = _get("/movie/now_playing", params={"language": "pt-BR", "region": "BR"})
    filmes = data.get("results", [])[:limit]

    # Formatar
    now_playing_movies = []
    for filme in filmes:
        now_playing_movies.append({
            'tmdb_id': filme.get('id'),
            'titulo': filme.get('title'),
            'ano': filme.get('release_date', '')[:4] if filme.get('release_date') else '',
            'nota': filme.get('vote_average', 0),
            'nota_estrelas': converter_para_estrelas(filme.get('vote_average', 0)),
            'poster_path': filme.get('poster_path'),
            'backdrop_path': filme.get('backdrop_path'),
            'sinopse': filme.get('overview', ''),
            'generos': []
        })

    # Salvar no cache
    if usar_cache and now_playing_movies:
        cache_payload = {
            'cache_type': cache_key,
            'filmes': now_playing_movies
        }
        FilmeCache.objects.update_or_create(
            id_tmdb=999995,
            defaults={'payload': cache_payload}
        )

    return now_playing_movies

def obter_classicos(limit=12, usar_cache=True):
    """Busca filmes clássicos (filmes antigos bem avaliados)"""
    cache_key = f"classics_{limit}"

    if usar_cache:
        try:
            fc = FilmeCache.objects.filter(id_tmdb=999994).first()
            if fc and fc.payload.get('cache_type') == cache_key:
                if (datetime.now(timezone.utc) - fc.atualizado_em) < timedelta(hours=24):
                    return fc.payload.get('filmes', [])
        except:
            pass

    # Buscar filmes clássicos (top rated com data antiga)
    classics_movies = []

    # Buscar múltiplas páginas para ter mais opções
    for page in range(1, 5):
        try:
            data = _get("/movie/top_rated", params={"language": "pt-BR", "page": page})
            filmes = data.get("results", [])

            # Filtrar filmes antigos (antes de 2000) com boa avaliação
            for filme in filmes:
                if len(classics_movies) >= limit:
                    break

                # Verificar se é um filme antigo (antes de 2000) com boa nota
                release_date = filme.get('release_date', '')
                if release_date:
                    try:
                        year = int(release_date[:4])
                        vote_avg = filme.get('vote_average', 0)
                        vote_count = filme.get('vote_count', 0)

                        if year < 2000 and vote_avg >= 7.5 and vote_count >= 500:
                            classics_movies.append({
                                'tmdb_id': filme.get('id'),
                                'titulo': filme.get('title'),
                                'ano': year,
                                'nota': vote_avg,
                                'nota_estrelas': converter_para_estrelas(vote_avg),
                                'poster_path': filme.get('poster_path'),
                                'backdrop_path': filme.get('backdrop_path'),
                                'sinopse': filme.get('overview', ''),
                                'generos': []
                            })
                    except ValueError:
                        continue

            if len(classics_movies) >= limit:
                break

        except Exception as e:
            print(f"Erro ao buscar página {page} de clássicos: {e}")
            continue

    # Ordenar por nota e depois por ano (mais antigos primeiro em caso de empate)
    classics_movies.sort(key=lambda x: (x['nota'], -x['ano']), reverse=True)
    classics_movies = classics_movies[:limit]

    # Salvar no cache
    if usar_cache and classics_movies:
        cache_payload = {
            'cache_type': cache_key,
            'filmes': classics_movies
        }
        FilmeCache.objects.update_or_create(
            id_tmdb=999994,
            defaults={'payload': cache_payload}
        )

    return classics_movies

def buscar_detalhes_serie(tmdb_id):
    """Busca detalhes completos de uma série no TMDb"""
   
    api_key = settings.TMDB_API_KEY
    url = f"https://api.themoviedb.org/3/tv/{tmdb_id}"
    
    params = {
        'api_key': api_key,
        'language': 'pt-BR',
        'append_to_response': 'credits,videos,images,similar,content_ratings'
    }
    
    response = requests.get(url, params=params)
    response.raise_for_status()
    data = response.json()
    
    # Formatar dados
    return {
        'tmdb_id': data.get('id'),
        'titulo': data.get('name'),
        'titulo_original': data.get('original_name'),
        'sinopse': data.get('overview'),
        'poster_path': data.get('poster_path'),
        'backdrop_path': data.get('backdrop_path'),
        'nota_tmdb': data.get('vote_average'),
        'votos': data.get('vote_count'),
        'numero_temporadas': data.get('number_of_seasons'),
        'numero_episodios': data.get('number_of_episodes'),
        'status': traduzir_status_serie(data.get('status')),
        'data_primeira_exibicao': data.get('first_air_date'),
        'data_ultima_exibicao': data.get('last_air_date'),
        'criadores': [c.get('name') for c in data.get('created_by', [])],
        'generos': [g.get('name') for g in data.get('genres', [])],
        'redes': [n.get('name') for n in data.get('networks', [])],
        'elenco_principal': formatar_elenco(data.get('credits', {}).get('cast', [])[:10]),
        'equipe': formatar_equipe_serie(data.get('credits', {}).get('crew', [])),
        'temporadas': data.get('seasons', []),
        'videos': data.get('videos', {}).get('results', []),
        'series_similares': data.get('similar', {}).get('results', [])[:12],
    }

def buscar_temporada(tmdb_id, numero_temporada):
    """Busca detalhes de uma temporada específica"""

    api_key = settings.TMDB_API_KEY
    url = f"https://api.themoviedb.org/3/tv/{tmdb_id}/season/{numero_temporada}"
    
    params = {
        'api_key': api_key,
        'language': 'pt-BR'
    }
    
    response = requests.get(url, params=params)
    response.raise_for_status()
    data = response.json()
    
    return {
        'numero_temporada': data.get('season_number'),
        'nome': data.get('name'),
        'sinopse': data.get('overview'),
        'poster_path': data.get('poster_path'),
        'data_exibicao': data.get('air_date'),
        'episodios': [
            {
                'numero': ep.get('episode_number'),
                'nome': ep.get('name'),
                'sinopse': ep.get('overview'),
                'nota': ep.get('vote_average'),
                'data_exibicao': ep.get('air_date'),
                'duracao': ep.get('runtime'),
                'imagem': ep.get('still_path')
            }
            for ep in data.get('episodes', [])
        ]
    }

def traduzir_status_serie(status):
    """Traduz o status da série"""
    traducoes = {
        'Returning Series': 'Em exibição',
        'Ended': 'Finalizada',
        'Canceled': 'Cancelada',
        'In Production': 'Em produção',
        'Planned': 'Planejada'
    }
    return traducoes.get(status, status)

def formatar_equipe_serie(crew):
    """Formata a equipe de uma série"""
    cargos_importantes = ['Creator', 'Executive Producer', 'Producer', 'Writer', 'Director']
    equipe_filtrada = []
    
    for membro in crew:
        if membro.get('job') in cargos_importantes:
            equipe_filtrada.append({
                'nome': membro.get('name'),
                'cargo': traduzir_cargo(membro.get('job')),
                'foto_path': membro.get('profile_path')
            })
    
    return equipe_filtrada[:20]  # Limitar a 20

def formatar_elenco(cast_list):
    elenco_formatado = []
    
    for ator in cast_list[:20]:  # Limitar a 20 atores
        elenco_formatado.append({
            'nome': ator.get('name', 'Nome não disponível'),
            'personagem': ator.get('character', 'Personagem não disponível'),
            'foto_path': ator.get('profile_path'),
            'ordem': ator.get('order', 999)
        })
    
    # Ordenar por ordem de aparição
    elenco_formatado.sort(key=lambda x: x['ordem'])
    
    return elenco_formatado

def traduzir_cargo(cargo):
    """Traduz cargos para português"""
    traducoes = {
        'Creator': 'Criador',
        'Executive Producer': 'Produtor Executivo',
        'Producer': 'Produtor',
        'Writer': 'Roteirista',
        'Director': 'Diretor'
    }
    return traducoes.get(cargo, cargo)
def buscar_serie_por_titulo(query, page=1):
    """Busca séries por título"""
    data = _get("/search/tv", params={"language": "pt-BR", "query": query, "page": page})
    series = data.get("results", [])
    
    return [{
        'tmdb_id': serie.get('id'),
        'titulo': serie.get('name'),
        'sinopse': serie.get('overview'),
        'poster_path': serie.get('poster_path'),
        'backdrop_path': serie.get('backdrop_path'),
        'ano_lancamento': serie.get('first_air_date', '')[:4] if serie.get('first_air_date') else '',
        'nota_tmdb': serie.get('vote_average'),
        'tipo': 'serie'
    } for serie in series]


def obter_videos_filme(tmdb_id):
    """Busca vídeos (trailers, teasers, etc) de um filme"""
    try:
        # Buscar vídeos do filme
        data = _get(f"/movie/{tmdb_id}/videos", params={"language": "pt-BR"})
        videos = data.get('results', [])
        
        # Se não houver vídeos em português, buscar em inglês
        if not videos:
            data = _get(f"/movie/{tmdb_id}/videos", params={"language": "en-US"})
            videos = data.get('results', [])
        
        return videos
    except Exception as e:
        print(f"Erro ao buscar vídeos do filme {tmdb_id}: {str(e)}")
        return []


def obter_ratings_omdb(imdb_id):
    """
    Busca ratings do Metacritic e Rotten Tomatoes via OMDB API
    
    Args:
        imdb_id: ID do IMDb (ex: 'tt0111161')
        
    Returns:
        dict com 'metacritic', 'rotten_tomatoes', 'imdb_rating', 'imdb_votes'
    """
    if not imdb_id:
        return None
        
    try:
        url = f"{settings.OMDB_BASE_URL}?apikey={settings.OMDB_API_KEY}&i={imdb_id}"
        response = requests.get(url, timeout=5)
        
        if response.status_code != 200:
            print(f"Erro OMDB API: status {response.status_code}")
            return None
            
        data = response.json()
        
        if data.get('Response') == 'False':
            print(f"OMDB não encontrou filme: {data.get('Error')}")
            return None
        
        # Extrair ratings
        ratings = {}
        
        # IMDb rating
        if data.get('imdbRating') and data.get('imdbRating') != 'N/A':
            ratings['imdb_rating'] = float(data['imdbRating'])
        if data.get('imdbVotes') and data.get('imdbVotes') != 'N/A':
            ratings['imdb_votes'] = data['imdbVotes']
        
        # Metacritic
        if data.get('Metascore') and data.get('Metascore') != 'N/A':
            ratings['metacritic'] = int(data['Metascore'])
        
        # Rotten Tomatoes - procurar no array de Ratings
        for rating in data.get('Ratings', []):
            if rating['Source'] == 'Rotten Tomatoes':
                # Converte '87%' para 87
                rt_value = rating['Value'].replace('%', '')
                try:
                    ratings['rotten_tomatoes'] = int(rt_value)
                except ValueError:
                    pass
                break
        
        return ratings if ratings else None
        
    except Exception as e:
        print(f"Erro ao buscar ratings OMDB para {imdb_id}: {str(e)}")
        return None