from django.core.management.base import BaseCommand
from backstage.models import Filme

class Command(BaseCommand):
    help = 'Busca filmes pelo título parcial e exibe tmdb_id e poster'

    def add_arguments(self, parser):
        parser.add_argument('terms', nargs='+', type=str)

    def handle(self, *args, **options):
        terms = options['terms']
        for term in terms:
            qs = Filme.objects.filter(titulo__icontains=term)
            self.stdout.write(f"--- Buscando: {term} -> {qs.count()} resultados")
            for f in qs:
                self.stdout.write(f"id={f.id} tmdb_id={f.tmdb_id} titulo='{f.titulo}' poster={f.poster}")
            self.stdout.write('')
