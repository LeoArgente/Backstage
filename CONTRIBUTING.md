# 🤝 Contribuindo com o Backstage

Olá! 👋 Que bom ter você por aqui. Se você está pensando em contribuir com o projeto Backstage, seja muito bem-vindo! Abaixo você encontra tudo o que precisa para começar a colaborar com o nosso desenvolvimento.

## 🧰 Pré-requisitos

Antes de colocar a mão na massa, certifique-se de ter as seguintes ferramentas instaladas:

* __Python 3.8+__
* __Django 4.x__
* __Git__
* __Visual Studio Code (VSCode)__

## 🚀 Configurando o Ambiente

Siga os passos abaixo para rodar o projeto localmente:

### Passos para Configuração

```
# *******************************************
#          1. Clone o Repositório           *
# *******************************************

Abra seu terminal e navegue até o diretório onde deseja clonar o repositório. 
Em seguida, execute o comando abaixo:

git clone https://github.com/marilializ/Backstage.git

# *******************************************
#   2. Navegue até o Diretório do Projeto   *
# *******************************************

Use o comando:

cd Backstage

# *******************************************
#    3. Crie e Ative um Ambiente Virtual    *
# *******************************************

Caso não tenha, faça o download usando o comando:

pip install virtualenv

Para criar um ambiente virtual, execute o seguinte comando:

python -m venv venv

Para ativar o ambiente virtual:

No Windows:

source venv/Scripts/activate

No macOS/Linux:

source venv/bin/activate

# *******************************************
#        4. Instale as Dependências         *
# *******************************************

Com o ambiente virtual ativado dentro da mesma pasta, instale as dependências necessárias:

pip install -r requirements.txt

# *******************************************
#        5. Execute as Migrações            *
# *******************************************

Realize as migrações no banco usando:
(Note que em alguns dispositivos é usado py como prefixo ao invés de python)

python manage.py makemigrations

E depois:

python manage.py migrate

# *******************************************
#    6. Crie um Superusuário (Opcional)     *
# *******************************************

Para acessar o painel administrativo do Django:

python manage.py createsuperuser

# *******************************************
#  7. Execute o Servidor de Desenvolvimento *
# *******************************************

Finalmente, para iniciar o servidor de desenvolvimento, execute:

python manage.py runserver

Agora, você deve ser capaz de acessar o aplicativo em seu navegador, 
normalmente o servidor local é http://localhost:8000/.

# *******************************************
#        8. Contribuindo com Código         *
# *******************************************

Recomendamos o uso do Visual Studio Code (VSCode) para desenvolver o projeto. 
Para abrir o projeto no VSCode, siga os passos abaixo:
```

Abra o VSCode.
Clique em File > Open Folder... e selecione o diretório do projeto Backstage.
Certifique-se de que o ambiente virtual esteja ativado no terminal do VSCode.

## 📤 Processo de Revisão

Abra um Pull Request.

Nossa equipe irá analisar todos os pull requests. Apenas aqueles que forem coerentes e estiverem alinhados com os objetivos do projeto serão aprovados.


## ❓ Dúvidas?

Se tiver qualquer dúvida, sinta-se à vontade para abrir uma issue.

## 📚 Recursos Úteis

* [Histórias de Usuário](https://docs.google.com/document/d/1aqIHFkvABIIP391eOZYChAOS2tJbzDw3llCjle1GSi0/edit?usp=sharing)
* [Backlog no Jira](https://backstage2025.atlassian.net/jira/software/projects/SCRUM/boards/1/backlog)
* [Relatório de Programação em Par](https://docs.google.com/document/d/1HIxRn-m3WkP-25n1E8wzRNDGOBeI7m8e7uyD_I04urM/edit?usp=sharing)

---

**Obrigado por contribuir com o Backstage! 🎬✨**
