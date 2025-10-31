from django.db import models
from django.conf import settings
from django.contrib.auth.models import User
from django.utils.text import slugify
import string
import random

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
    nome = models.CharField(max_length=100, verbose_name="Nome da Comunidade")
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    descricao = models.TextField(blank=True, null=True, verbose_name="Descrição")
    publica = models.BooleanField(default=True, verbose_name="Comunidade pública")
    codigo_convite = models.CharField(max_length=8, unique=True, blank=True)
    criador = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='comunidades_criadas'
    )
    membros = models.ManyToManyField(
        settings.AUTH_USER_MODEL, 
        through='MembroComunidade', 
        related_name='comunidades'
    )
    data_criacao = models.DateTimeField(auto_now_add=True)
    data_atualizacao = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Comunidade"
        verbose_name_plural = "Comunidades"
        ordering = ['-data_criacao']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.nome)
            # Garantir que o slug seja único
            original_slug = self.slug
            counter = 1
            while Comunidade.objects.filter(slug=self.slug).exists():
                self.slug = f"{original_slug}-{counter}"
                counter += 1
        
        if not self.codigo_convite:
            self.codigo_convite = self.gerar_codigo_convite()
        
        super().save(*args, **kwargs)

    def gerar_codigo_convite(self):
        """Gera um código de convite único de 8 caracteres"""
        while True:
            codigo = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
            if not Comunidade.objects.filter(codigo_convite=codigo).exists():
                return codigo

    def __str__(self):
        return self.nome


class MembroComunidade(models.Model):
    ROLES = [
        ('admin', 'Administrador'),
        ('mod', 'Moderador'),
        ('member', 'Membro'),
    ]
    
    comunidade = models.ForeignKey(Comunidade, on_delete=models.CASCADE, related_name='membros_detalhes')
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=ROLES, default='member')
    data_entrada = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('comunidade', 'usuario')
        verbose_name = "Membro da Comunidade"
        verbose_name_plural = "Membros da Comunidade"

    def __str__(self):
        return f"{self.usuario.username} em {self.comunidade.nome} ({self.get_role_display()})"


class SolicitacaoAmizade(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pendente'),
        ('accepted', 'Aceita'),
        ('rejected', 'Rejeitada'),
    ]
    
    remetente = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='solicitacoes_enviadas'
    )
    destinatario = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='solicitacoes_recebidas'
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    data_criacao = models.DateTimeField(auto_now_add=True)
    data_atualizacao = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('remetente', 'destinatario')
        verbose_name = "Solicitação de Amizade"
        verbose_name_plural = "Solicitações de Amizade"
        ordering = ['-data_criacao']

    def __str__(self):
        return f"{self.remetente.username} → {self.destinatario.username} ({self.get_status_display()})"


class Amizade(models.Model):
    usuario1 = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='amizades_usuario1'
    )
    usuario2 = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='amizades_usuario2'
    )
    data_criacao = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('usuario1', 'usuario2')
        verbose_name = "Amizade"
        verbose_name_plural = "Amizades"
        ordering = ['-data_criacao']

    def __str__(self):
        return f"{self.usuario1.username} ↔ {self.usuario2.username}"

class DiarioFilme(models.Model):
    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='diario_filmes'
    )
    filme = models.ForeignKey(Filme, on_delete=models.CASCADE)
    data_assistido = models.DateField(verbose_name="Data que assistiu")
    nota = models.IntegerField(
        choices=[(i, f"{i} ⭐") for i in range(1, 6)],
        default=5,
        verbose_name="Avaliação"
    )
    assistido_com = models.CharField(
        max_length=200,
        blank=True,
        null=True,
        verbose_name="Assistido com"
    )
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('usuario', 'filme', 'data_assistido')
        verbose_name = "Entrada do Diário"
        verbose_name_plural = "Entradas do Diário"
        ordering = ['-data_assistido', '-criado_em']

    def __str__(self):
        return f"{self.usuario.username} - {self.filme.titulo} ({self.data_assistido})"
