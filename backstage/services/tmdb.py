import requests
from django.conf import settings
from datetime import datetime, timedelta, timezone
from ..models import FilmeCache

SESS = requests.Session()
SESS.headers.update({"Accept": "application/json"})

def _get(endpoint, params=None):
    params = params or {}
    params["api_key"] = settings.TMDB_API_KEY
    url = f"{settings.TMDB_BASE_URL}{endpoint}"
    resp = SESS.get(url, params=params, timeout=10)
    resp.raise_for_status()
    return resp.json()

def buscar_detalhes_filme(id_tmdb: int):
    return _get(f"/movie/{id_tmdb}", params={"language": "pt-BR"})

def buscar_creditos(id_tmdb: int):
    return _get(f"/movie/{id_tmdb}/credits", params={"language": "pt-BR"})

def buscar_plataformas(id_tmdb: int, region: str):
    data = _get(f"/movie/{id_tmdb}/watch/providers")
    # provedores por país (ex.: data["results"]["BR"]["flatrate"])
    return data.get("results", {}).get(region, {})

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

    return {
        "id_tmdb": id_tmdb,
        "titulo": detalhes.get("title"),
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

# ---------- Cache helpers (opcional) ----------
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
