"""
Script para deletar usuários de teste do Cypress
"""
import os
import django

# Configura o Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')
os.environ.setdefault('TARGET_ENV', 'development')
django.setup()

from django.contrib.auth.models import User

def deletar_usuarios_teste():
    """Deleta todos os usuários de teste criados pelo Cypress"""
    try:
        # Lista de usernames de teste
        usernames_teste = ['TesteCypress', 'testuser', 'Teste Cypress']

        for username in usernames_teste:
            usuarios = User.objects.filter(username=username)
            if usuarios.exists():
                usuarios.delete()
                print(f'✓ Usuário "{username}" deletado com sucesso')
            else:
                print(f'  Usuário "{username}" não encontrado')

        print('\n✓ Limpeza de usuários de teste concluída!')

    except Exception as e:
        print(f'✗ Erro ao deletar usuários: {str(e)}')

if __name__ == '__main__':
    deletar_usuarios_teste()
