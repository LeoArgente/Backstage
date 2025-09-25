from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import UserCreationForm

def index(request):
    return render(request, "backstage/index.html")

# backend lou e leo #################################################################
def pagina_login(request):
    if request.method == "POST":
        username = request.POST.get('username', '')
        senha = request.POST.get('password', '')
        user = authenticate(request, username=username, password=senha)
        if user is not None:
            login(request, user)
            return redirect('backstage:home')  # usa namespace do app
        return render(request, 'backstage/login.html', {'erro': 'Usuário ou senha inválidos'})
    return render(request, 'backstage/login.html')

@login_required(login_url='backstage:login')
def home(request):
    return render(request, 'backstage/index.html')

def sair(request):
    logout(request)
    return redirect('backstage:login')

# views login/home/sair

def registrar(request):
    if request.user.is_authenticated:
        return redirect('backstage:home')

    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            usuario = form.save()  # cria o user
            # auto-login após cadastro
            login(request, usuario)
            return redirect('backstage:home')
    else:
        form = UserCreationForm()

    return render(request, 'backstage/register.html', {'form': form})

##################################################################################################

# front nononha e liz

def community(request):
    return render(request, "backstage/community.html")

def filmes(request):
    return render(request, "backstage/filmes.html")

def lists(request):
    return render(request, "backstage/lists.html")

def movies(request):
    return render(request, "backstage/movies.html")

def noticias(request):
    return render(request, "backstage/noticias.html")

def series(request):
    return render(request, "backstage/series.html")

def wireframer(request):
    return render(request, "backstage/wireframer.html")

###########################################################################

# back vitor e henrique

from .models import Filme, Critica

@login_required
def adicionar_critica(request, filme_id):
    filme = get_object_or_404(Filme, id=filme_id)
    notas = [5.0, 4.5, 4.0, 3.5, 3.0, 2.5, 2.0, 1.5, 1.0, 0.5]

    if request.method == "POST":
        texto = request.POST.get('texto')
        nota = request.POST.get('nota')

        if texto and nota:
            Critica.objects.create(
                filme=filme,
                usuario=request.user,
                texto=texto,
                nota=float(nota)  # garante que vem como número
            )
            return redirect('detalhes_filme', filme_id=filme.id)
        else:
            erro = "Todos os campos são obrigatórios."
            return render(
                request,
                'adicionar_critica.html',
                {'filme': filme, 'erro': erro, 'notas': notas}
            )

    return render(request, 'adicionar_critica.html', {'filme': filme, 'notas':{notas}})

def detalhes_filme(request, filme_id):
    return render(request, "backstage/detalhes_filme.html", {"filme_id": filme_id})
