from django.db import models
from django.conf import settings
from django.contrib.auth.models import User

class Filme(models.Model):
    tmdb_id = models.IntegerField(unique=True, null=True, blank=True)
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
    nota = models.IntegerField(choices=[(i, f"{i} ⭐") for i in range(1, 6)], default=5)
    tem_spoiler = models.BooleanField(default=False, verbose_name="Contém spoiler")
    criado_em = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.usuario} - {self.filme} ({self.nota})"

class FilmeCache(models.Model):
    id_tmdb = models.PositiveIntegerField(unique=True)
    payload = models.JSONField()
    atualizado_em = models.DateTimeField(auto_now=True)
    class Meta:
        ordering = ('-atualizado_em',)

    def __str__(self):
        return f'{self.id_tmdb} (atualizado_em={self.atualizado_em})'


class Lista(models.Model):
    nome = models.CharField(max_length=100)
    descricao = models.TextField(blank=True, null=True)
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    publica = models.BooleanField(default=False)
    criada_em = models.DateTimeField(auto_now_add=True)
    atualizada_em = models.DateTimeField(auto_now=True)

class ItemLista(models.Model):
    lista = models.ForeignKey(Lista, on_delete=models.CASCADE, related_name='itens')
    filme = models.ForeignKey(Filme, on_delete=models.CASCADE)
    adicionado_em = models.DateTimeField(auto_now_add=True)
    posicao = models.PositiveIntegerField(default=0)
    class Meta:
        unique_together = ('lista', 'filme')

class Serie(models.Model):
    tmdb_id = models.IntegerField(unique=True)
    titulo = models.CharField(max_length=255)
    descricao = models.TextField(blank=True, null=True)
    numero_temporadas = models.IntegerField(default=0)
    numero_episodios = models.IntegerField(default=0)
    status = models.CharField(max_length=50, blank=True, null=True)  # "Em exibição", "Finalizada"
    data_primeira_exibicao = models.DateField(blank=True, null=True)
    data_ultima_exibicao = models.DateField(blank=True, null=True)
    poster = models.URLField(blank=True, null=True)
    backdrop = models.URLField(blank=True, null=True)

    def __str__(self):
        return self.titulo

class CriticaSerie(models.Model):
    serie = models.ForeignKey(Serie, on_delete=models.CASCADE, related_name="criticas")
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    texto = models.TextField("Sua análise")
    nota = models.IntegerField(choices=[(i, f"{i} ⭐") for i in range(1, 6)], default=5)
    tem_spoiler = models.BooleanField(default=False, verbose_name="Contém spoiler")
    criado_em = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.usuario} - {self.serie} ({self.nota})"

class ItemListaSerie(models.Model):
    lista = models.ForeignKey(Lista, on_delete=models.CASCADE, related_name='itens_serie')
    serie = models.ForeignKey(Serie, on_delete=models.CASCADE)
    adicionado_em = models.DateTimeField(auto_now_add=True)
    posicao = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ('lista', 'serie')

    def __str__(self):
        return f"{self.serie.titulo} em {self.lista.nome}"


class Comunidade(models.Model):
    nome = models.CharField(max_length=100)
    descricao = models.TextField(blank=True, null=True)
    criador = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='comunidades_criadas')
    membros = models.ManyToManyField(settings.AUTH_USER_MODEL, through='MembroComunidade', related_name='comunidades')
    publica = models.BooleanField(default=True)
    imagem_capa = models.URLField(blank=True, null=True)
    criada_em = models.DateTimeField(auto_now_add=True)
    atualizada_em = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-criada_em']
    
    def __str__(self):
        return self.nome
    
    @property
    def num_membros(self):
        return self.membros.count()

class MembroComunidade(models.Model):
    ROLES = [
        ('admin', 'Administrador'),
        ('moderador', 'Moderador'),
        ('membro', 'Membro'),
    ]
    
    comunidade = models.ForeignKey(Comunidade, on_delete=models.CASCADE)
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=ROLES, default='membro')
    data_entrada = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('comunidade', 'usuario')
    
    def __str__(self):
        return f"{self.usuario.username} - {self.comunidade.nome} ({self.role})"

class PostComunidade(models.Model):
    TIPOS = [
        ('discussao', 'Discussão'),
        ('avaliacao', 'Avaliação'),
        ('recomendacao', 'Recomendação'),
        ('lista', 'Lista'),
    ]
    
    comunidade = models.ForeignKey(Comunidade, on_delete=models.CASCADE, related_name='posts')
    autor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    tipo = models.CharField(max_length=20, choices=TIPOS, default='discussao')
    titulo = models.CharField(max_length=200)
    conteudo = models.TextField()
    filme = models.ForeignKey(Filme, on_delete=models.CASCADE, null=True, blank=True)
    serie = models.ForeignKey(Serie, on_delete=models.CASCADE, null=True, blank=True)
    lista = models.ForeignKey(Lista, on_delete=models.CASCADE, null=True, blank=True)
    nota = models.IntegerField(null=True, blank=True, choices=[(i, f"{i} ⭐") for i in range(1, 6)])
    criado_em = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-criado_em']
    
    def __str__(self):
        return f"{self.titulo} - {self.comunidade.nome}"

