import json
from urllib import request, parse
from datetime import datetime, timedelta, timezone
from django.conf import settings
from ..models import FilmeCache

def _get(endpoint, params=None):
    params = params or {}
    params["api_key"] = settings.TMDB_API_KEY
    url = f"{settings.TMDB_BASE_URL}{endpoint}?{parse.urlencode(params)}"

    with request.urlopen(url) as resp:
        if resp.status != 200:
            raise Exception(f"Erro TMDb: status {resp.status}")
        return json.load(resp)

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

def buscar_filme_por_titulo(query, page=1):
    data = _get("/search/movie", params={"language": "pt-BR", "query": query, "page": page})
    filmes = data.get("results", [])
    # Padroniza os campos
    return [{
        'id_tmdb': filme.get('id'),
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
        filme = random.choice(filmes[:5])  # Escolhe entre os 5 primeiros
        # Já vem padronizado da função buscar_filmes_em_cartaz
        filme['duracao_min'] = 120  # Valor padrão
        # Converter nota da escala 10 para escala 5 com 1 casa decimal
        if filme.get('nota_tmdb'):
            filme['nota_escala_5'] = round(filme['nota_tmdb'] / 2, 1)
        else:
            filme['nota_escala_5'] = 4.0  # Valor padrão
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

def montar_payload_agregado(id_tmdb: int, region: str = None):
    region = region or getattr(settings, "TMDB_DEFAULT_REGION", "BR")

    detalhes = buscar_detalhes_filme(id_tmdb)
    creditos = buscar_creditos(id_tmdb)
    provs = buscar_plataformas(id_tmdb, region)

    elenco = creditos.get("cast", []) or []
    elenco_ordenado = sorted(elenco, key=lambda c: c.get("order", 999))[:10]

    plataformas = []
    for tipo in ("flatrate", "rent", "buy", "ads", "free"):
        for p in provs.get(tipo, []) or []:
            plataformas.append({
                "nome": p.get("provider_name"),
                "logo_path": p.get("logo_path"),
                "tipo": tipo
            })
    # Retorna com campos padronizados
    return {
        "tmdb_id": id_tmdb,
        "titulo": detalhes.get("title"),
        "sinopse": detalhes.get("overview"),
        "poster_path": detalhes.get("poster_path"),
        "backdrop_path": detalhes.get("backdrop_path"),
        "ano_lancamento": detalhes.get("release_date", "")[:4] if detalhes.get("release_date") else "",
        "nota_tmdb": detalhes.get("vote_average"),
        "duracao_min": detalhes.get("runtime"),
        "generos": [genero.get("name") for genero in detalhes.get("genres", [])],
        "elenco_principal": [
            {
                "nome": p.get("name"),
                "personagem": p.get("character"),
                "foto_path": p.get("profile_path")
            }
            for p in elenco_ordenado
        ],
        "plataformas": plataformas
    }

def obter_detalhes_com_cache(id_tmdb: int, ttl_minutos: int = 1440, region: str = None):
    # Tenta usar cache até 'ttl_minutos' (default 24h). Se expirado, refaz na TMDb e atualiza.
    try:
        fc = FilmeCache.objects.get(id_tmdb=id_tmdb)
        if (datetime.now(timezone.utc) - fc.atualizado_em) < timedelta(minutes=ttl_minutos):
            return fc.payload
    except FilmeCache.DoesNotExist:
        fc = None

    payload = montar_payload_agregado(id_tmdb, region=region)
    if fc:
        fc.payload = payload
        fc.save(update_fields=["payload", "atualizado_em"])
    else:
        FilmeCache.objects.create(id_tmdb=id_tmdb, payload=payload)
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
        trending_movies.append({
            'tmdb_id': filme.get('id'),
            'titulo': filme.get('title'),
            'ano': filme.get('release_date', '')[:4] if filme.get('release_date') else '',
            'nota': filme.get('vote_average', 0),
            'nota_estrelas': converter_para_estrelas(filme.get('vote_average', 0)),
            'poster_path': filme.get('poster_path'),
            'backdrop_path': filme.get('backdrop_path'),
            'sinopse': filme.get('overview', ''),
            'generos': []  # Seria necessário buscar detalhes para ter gêneros
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

def obter_recomendados(limit=12, usar_cache=True):
    """Busca filmes recomendados (populares com boa nota)"""
    cache_key = f"recommended_{limit}"

    if usar_cache:
        try:
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
        cache_payload = {
            'cache_type': cache_key,
            'filmes': recommended_movies
        }
        FilmeCache.objects.update_or_create(
            id_tmdb=999997,
            defaults={'payload': cache_payload}
        )

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
    from django.conf import settings
    import requests
    
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
    from django.conf import settings
    import requests
    
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