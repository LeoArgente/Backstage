#!/usr/bin/env python
import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')
django.setup()

from backstage.models import FilmeCache

print("Filmes no cache:")
print("-" * 50)

for cache in FilmeCache.objects.all():
    titulo = cache.payload.get("titulo", "N/A")
    print(f"ID TMDb: {cache.id_tmdb}")
    print(f"Título: {titulo}")
    print(f"Atualizado em: {cache.atualizado_em}")
    print("-" * 30)

print(f"\nTotal de filmes no cache: {FilmeCache.objects.count()}")