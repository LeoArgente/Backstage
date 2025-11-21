from django.core.management.base import BaseCommand
from backstage.models import Filme
from backstage.services.tmdb import obter_detalhes_com_cache


class Command(BaseCommand):
    help = 'Corrige títulos vazios de filmes buscando dados do TMDb'

    def handle(self, *args, **options):
        # Buscar filmes sem título
        filmes_sem_titulo = Filme.objects.filter(titulo__isnull=True) | Filme.objects.filter(titulo='')
        total = filmes_sem_titulo.count()
        
        if total == 0:
            self.stdout.write(self.style.SUCCESS('Nenhum filme sem título encontrado!'))
            return
        
        self.stdout.write(f'Encontrados {total} filmes sem título. Corrigindo...')
        
        corrigidos = 0
        erros = 0
        
        for filme in filmes_sem_titulo:
            if filme.tmdb_id:
                try:
                    detalhes = obter_detalhes_com_cache(filme.tmdb_id)
                    if detalhes:
                        filme.titulo = detalhes.get('title', 'Sem título')
                        filme.descricao = detalhes.get('overview', '')
                        
                        if detalhes.get('poster_path'):
                            filme.poster = f"https://image.tmdb.org/t/p/w500{detalhes.get('poster_path')}"
                        
                        if detalhes.get('release_date'):
                            try:
                                from datetime import datetime
                                filme.data_lancamento = datetime.strptime(detalhes.get('release_date'), '%Y-%m-%d').date()
                            except:
                                pass
                        
                        filme.save()
                        corrigidos += 1
                        self.stdout.write(self.style.SUCCESS(f'✓ {filme.titulo} (TMDb ID: {filme.tmdb_id})'))
                    else:
                        erros += 1
                        self.stdout.write(self.style.ERROR(f'✗ Filme TMDb ID {filme.tmdb_id} - Detalhes não encontrados'))
                except Exception as e:
                    erros += 1
                    self.stdout.write(self.style.ERROR(f'✗ Erro ao processar filme ID {filme.id}: {e}'))
            else:
                erros += 1
                self.stdout.write(self.style.WARNING(f'⚠ Filme ID {filme.id} sem TMDb ID'))
        
        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS(f'Finalizado!'))
        self.stdout.write(f'Total corrigidos: {corrigidos}')
        self.stdout.write(f'Total com erro: {erros}')
