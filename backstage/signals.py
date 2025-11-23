from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import Lista, Profile


@receiver(post_save, sender=User)
def criar_lista_assistir_mais_tarde(sender, instance, created, **kwargs):
    """
    Cria automaticamente a lista 'Assistir Mais Tarde' 
    quando um novo usuário é registrado
    """
    if created:
        # Criar lista "Assistir Mais Tarde"
        Lista.objects.create(
            nome="Assistir Mais Tarde",
            descricao="Filmes e séries que você quer assistir em breve",
            usuario=instance,
            publica=False
        )
        
        # Criar Profile para o usuário
        Profile.objects.get_or_create(usuario=instance)
