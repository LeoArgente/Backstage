#!/usr/bin/env python
"""Script para corrigir títulos de filmes no banco de dados"""
import os
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')
django.setup()

from backstage.models import Filme
from backstage.services.tmdb import obter_detalhes_com_cache

def fix_titles():
    # Buscar filmes com título vazio ou "Sem título"
    filmes = Filme.objects.filter(titulo__in=['', 'Sem título']) | Filme.objects.filter(titulo__isnull=True)
    
    print(f"Encontrados {filmes.count()} filmes sem título correto")
    print("=" * 60)
    
    corrigidos = 0
    erros = 0
    
    for filme in filmes:
        try:
            print(f"\nFilme ID {filme.id}, TMDB ID {filme.tmdb_id}")
            print(f"  Título atual: '{filme.titulo}'")
            
            if not filme.tmdb_id:
                print("  ⚠️  Sem TMDB_ID, pulando...")
                continue
            
            # Buscar detalhes do TMDb
            detalhes = obter_detalhes_com_cache(filme.tmdb_id)
            
            # Atualizar campos
            filme.titulo = detalhes.get('titulo') or 'Sem título'
            filme.descricao = detalhes.get('sinopse') or filme.descricao or ''
            
            if detalhes.get('data_lancamento') and not filme.data_lancamento:
                filme.data_lancamento = detalhes.get('data_lancamento')
            
            if detalhes.get('poster_path'):
                filme.poster = f"https://image.tmdb.org/t/p/w500{detalhes['poster_path']}"
            
            filme.save()
            print(f"  ✓ Atualizado: '{filme.titulo}'")
            corrigidos += 1
            
        except Exception as e:
            print(f"  ✗ Erro: {e}")
            erros += 1
    
    print("\n" + "=" * 60)
    print(f"✓ {corrigidos} filmes corrigidos")
    if erros > 0:
        print(f"✗ {erros} erros")
    print("=" * 60)

if __name__ == '__main__':
    fix_titles()
