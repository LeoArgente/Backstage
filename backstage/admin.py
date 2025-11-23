from django.contrib import admin
from .models import Lista, FilmeCache, Filme, Profile, Comunidade, MembroComunidade, MensagemComunidade

admin.site.register(Lista)
admin.site.register(FilmeCache)
admin.site.register(Filme)
admin.site.register(Profile)
admin.site.register(Comunidade)
admin.site.register(MembroComunidade)
admin.site.register(MensagemComunidade)
