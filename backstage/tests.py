from django.test import TestCase
from django.conf import settings
from django.contrib.auth.models import User
from .models import Filme, Critica, Lista, Serie, CriticaSerie


class ConfigurationTests(TestCase):
    """Testes básicos de configuração do sistema"""
    
    def test_settings_loaded(self):
        """Testa se as configurações carregam corretamente"""
        self.assertIsNotNone(settings.SECRET_KEY)
    
    def test_static_url_configured(self):
        """Testa se STATIC_URL está configurado"""
        self.assertTrue(hasattr(settings, 'STATIC_URL'))
    
    def test_installed_apps_includes_backstage(self):
        """Verifica se o app backstage está instalado"""
        self.assertIn('backstage', settings.INSTALLED_APPS)


class FilmeModelTests(TestCase):
    """Testes do modelo Filme"""
    
    def test_create_filme(self):
        """Testa criação de filme"""
        filme = Filme.objects.create(
            titulo='Inception',
            descricao='Um filme sobre sonhos',
            tmdb_id=27205
        )
        self.assertEqual(filme.titulo, 'Inception')
        self.assertEqual(filme.tmdb_id, 27205)
    
    def test_filme_string_representation(self):
        """Testa representação em string do filme"""
        filme = Filme.objects.create(titulo='Interstellar')
        self.assertEqual(str(filme), 'Interstellar')


class CriticaModelTests(TestCase):
    """Testes do modelo Critica"""
    
    def setUp(self):
        """Prepara dados para os testes"""
        self.user = User.objects.create_user(username='testuser', password='12345')
        self.filme = Filme.objects.create(titulo='Inception', tmdb_id=27205)
    
    def test_create_critica(self):
        """Testa criação de crítica"""
        critica = Critica.objects.create(
            filme=self.filme,
            usuario=self.user,
            texto='Filme incrível!',
            nota=5,
            tem_spoiler=False
        )
        self.assertEqual(critica.nota, 5)
        self.assertEqual(critica.texto, 'Filme incrível!')
        self.assertFalse(critica.tem_spoiler)


class ListaModelTests(TestCase):
    """Testes do modelo Lista"""
    
    def setUp(self):
        """Prepara dados para os testes"""
        self.user = User.objects.create_user(username='testuser', password='12345')
    
    def test_create_lista(self):
        """Testa criação de lista"""
        lista = Lista.objects.create(
            nome='Meus Favoritos',
            descricao='Filmes que eu amo',
            usuario=self.user,
            publica=True
        )
        self.assertEqual(lista.nome, 'Meus Favoritos')
        self.assertTrue(lista.publica)
