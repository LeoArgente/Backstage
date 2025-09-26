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