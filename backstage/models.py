from django.db import models
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
