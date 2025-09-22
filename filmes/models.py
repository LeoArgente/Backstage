from django.db import models

class Filme(models.Model):
    titulo = models.CharField(max_length=200)
    ano = models.IntegerField()
    descricao = models.TextField()
    poster = models.URLField(blank=True, null=True)

    def __str__(self):
        return self.titulo
