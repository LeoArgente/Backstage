from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import UserCreationForm

def index(request):
    return render(request, "backstage/index.html")

# backend lou e leo

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
