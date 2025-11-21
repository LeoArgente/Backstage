from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from backstage.models import Lista


class Command(BaseCommand):
    help = 'Cria a lista "Assistir Mais Tarde" para todos os usuários que ainda não a possuem'

    def handle(self, *args, **options):
        usuarios_sem_lista = []
        listas_criadas = 0

        for user in User.objects.all():
            # Verificar se o usuário já tem a lista "Assistir Mais Tarde"
            if not Lista.objects.filter(usuario=user, nome="Assistir Mais Tarde").exists():
                Lista.objects.create(
                    nome="Assistir Mais Tarde",
                    descricao="Filmes e séries que você quer assistir em breve",
                    usuario=user,
                    publica=False
                )
                usuarios_sem_lista.append(user.username)
                listas_criadas += 1

        if listas_criadas > 0:
            self.stdout.write(
                self.style.SUCCESS(
                    f'✓ Lista "Assistir Mais Tarde" criada para {listas_criadas} usuário(s): {", ".join(usuarios_sem_lista)}'
                )
            )
        else:
            self.stdout.write(
                self.style.WARNING(
                    'Todos os usuários já possuem a lista "Assistir Mais Tarde"'
                )
            )
