from django.test import TestCase
from django.conf import settings
from django.contrib.auth.models import User


class SettingsTests(TestCase):
    """Testes básicos de configuração do sistema"""
    
    def test_settings_loaded(self):
        """Testa se as configurações carregam corretamente"""
        self.assertIsNotNone(settings.SECRET_KEY)
    
    def test_static_url_configured(self):
        """Testa se STATIC_URL está configurado"""
        self.assertTrue(hasattr(settings, 'STATIC_URL'))
        self.assertEqual(settings.STATIC_URL, '/static/')
    
    def test_installed_apps_includes_backstage(self):
        """Verifica se o app backstage está instalado"""
        self.assertIn('backstage', settings.INSTALLED_APPS)


class UserModelTests(TestCase):
    """Testes do modelo User"""
    
    def test_create_user(self):
        """Testa criação de usuário"""
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.assertEqual(user.username, 'testuser')
        self.assertEqual(user.email, 'test@example.com')
        self.assertTrue(user.check_password('testpass123'))
    
    def test_user_string_representation(self):
        """Testa representação em string do usuário"""
        user = User.objects.create_user(username='testuser')
        self.assertEqual(str(user), 'testuser')
