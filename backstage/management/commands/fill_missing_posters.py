from django.core.management.base import BaseCommand
from django.db.models import Q
from backstage.models import Filme
from backstage.services.tmdb import obter_detalhes_com_cache

class Command(BaseCommand):
    help = 'Preenche posters faltantes (poster is NULL or empty) buscando no TMDb'

    def handle(self, *args, **options):
        qs = Filme.objects.filter(Q(poster__isnull=True) | Q(poster__exact=''))
        total = qs.count()
        if total == 0:
            self.stdout.write(self.style.SUCCESS('Nenhum filme com poster ausente encontrado.'))
            return

        self.stdout.write(f'Encontrados {total} filmes sem poster. Atualizando...')
        updated = 0
        errors = 0
        for f in qs:
            if not f.tmdb_id:
                self.stdout.write(self.style.WARNING(f'Pulando id={f.id} sem tmdb_id'))
                continue
            try:
                detalhes = obter_detalhes_com_cache(f.tmdb_id)
                poster_path = detalhes.get('poster_path') if detalhes else None
                if poster_path and poster_path != 'None' and str(poster_path).strip():
                    f.poster = f'https://image.tmdb.org/t/p/w500{poster_path}'
                    f.save()
                    updated += 1
                    self.stdout.write(self.style.SUCCESS(f'✓ Atualizado: {f.titulo or f.tmdb_id}'))
                else:
                    self.stdout.write(self.style.WARNING(f'⚠ Sem poster no TMDb para {f.titulo or f.tmdb_id}'))
            except Exception as e:
                errors += 1
                self.stdout.write(self.style.ERROR(f'✗ Erro ao processar id={f.id}: {e}'))
        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS(f'Finalizado. Atualizados: {updated}'))
        if errors:
            self.stdout.write(self.style.ERROR(f'Erros: {errors}'))
