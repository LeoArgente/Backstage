from django.db import models
from django.conf import settings
#from django.contrib.auth.models import User

class Filme(models.Model):
    titulo = models.CharField(max_length=255)
    descricao = models.TextField(blank=True, null=True)
    elenco = models.TextField(blank=True, null=True)
    diretor = models.TextField(blank=True, null= True, max_length=30)
    categoria = models.TextField(blank=True, null= True, max_length=30)
    data_lancamento = models.DateField(blank=True, null=True)
    poster = models.URLField(blank=True, null=True)
    trailer = models.URLField(blank=True, null=True)

    def __str__(self):
        return self.titulo
    
class Critica(models.Model):
    filme = models.ForeignKey(Filme, on_delete=models.CASCADE, related_name="criticas")
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True)
    texto = models.TextField("Sua análise")
    nota = models.IntegerField("Nota", choices=[(i, i) for i in range(1, 11)])  # nota de 1 a 10
    criado_em = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.usuario} - {self.filme} ({self.nota})"
