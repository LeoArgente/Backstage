from django.shortcuts import render

def index(request):
    return render(request, "backstage/index.html")

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
