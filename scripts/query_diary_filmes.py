import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')
django.setup()
from backstage.models import Filme

terms = ['Vingadores', 'Batalha', 'Uma Batalha', 'Uma Batalha Após a Outra']
for term in terms:
    qs = Filme.objects.filter(titulo__icontains=term)
    print(f"--- Buscando: {term} -> {qs.count()} resultados")
    for f in qs:
        print(f"id={f.id} tmdb_id={f.tmdb_id} titulo='{f.titulo}' poster={f.poster}")
    print()
