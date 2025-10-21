# Backstage 🎥
#### Um site para registrar, avaliar e acompanhar todos os filmes que você assiste, criando seu próprio diário cinematográfico.

## Entre no **Backstage** e registre cada frame 🎞️
- Log de filmes assistidos: mantenha controle do que já viu.
- Avaliações por estrelas: destaque seus favoritos.
- Comentários e notas rápidas: registre impressões e insights.
- Filtros e organização: explore por gênero, avaliação, cast e mais.
----------------------------------------------------------------------------------------------------------------------------------------------
<details>
<summary> 🔗 LINKS IMPORTANTES </summary>
  
- [Jira](https://backstage2025.atlassian.net/jira/software/projects/SCRUM/boards/1/backlog)
  
- [Histórias](https://docs.google.com/document/d/1aqIHFkvABIIP391eOZYChAOS2tJbzDw3llCjle1GSi0/edit?usp=sharing)
  </details>
<details>
<summary> 📥 ENTREGA 1</summary>


O objetivo desta sprint foi criar a infraestrutura inicial do sistema, focando em funcionalidades essenciais para gerenciamento de usuários e informações sobre filmes. O sistema permite ao usuário ter uma comunidade com amigos, pesquisar filmes por título, gênero ou autor, criar e compartilhar rankings de filmes favoritos, avaliar filmes com estrelas, adicionar comentários, visualizar avaliações de outros usuários e receber alertas de spoilers.

Também é possível acompanhar detalhes dos filmes, como duração, elenco e plataformas de streaming, gerenciar o histórico pessoal de filmes assistidos, salvar filmes para assistir depois e controlar a privacidade de resenhas e histórico. Usuários podem acessar perfis de outros usuários e visualizar suas resenhas e filmes assistidos de acordo com as configurações de privacidade.

O protótipo de baixa fidelidade foi desenvolvido no Figma e apresentado em um [Screencast](https://youtu.be/LRqxvmqukJw), enquanto a gestão do projeto e backlog da Sprint 1 foi organizada no [Jira](https://backstage2025.atlassian.net/jira/software/projects/SCRUM/boards/1/backlog).

Link paras as histórias: [Histórias](https://docs.google.com/document/d/1aqIHFkvABIIP391eOZYChAOS2tJbzDw3llCjle1GSi0/edit?usp=sharing)

![Figma 1](https://raw.githubusercontent.com/marilializ/Backstage/main/imagens/figma1_correto.PNG)
![Sprint 1](https://raw.githubusercontent.com/marilializ/Backstage/main/imagens/Backlog1.PNG)
![Quadro 1](https://raw.githubusercontent.com/marilializ/Backstage/main/imagens/Primeiro_Quadro.PNG)

</details>

<details>
<summary> 📥 ENTREGA 2</summary>

O objetivo desta segunda sprint é dar início ao desenvolvimento do projeto, colocando em prática a implementação das primeiras histórias de usuário.

## HISTÓRIA 1:
Permite que o usuário veja os detalhes de um filme (elenco, duração, classificação...) ao clicar nele.

![História1](https://raw.githubusercontent.com/marilializ/Backstage/main/imagens/detalhes1.PNG)
![História1](https://raw.githubusercontent.com/marilializ/Backstage/main/imagens/detalhes2.PNG)
![História1](https://raw.githubusercontent.com/marilializ/Backstage/main/imagens/detalhes3.PNG)

## HISTÓRIA 2:
Permite que o usuário salve um filme para assistir mais tarde.

![História2](https://raw.githubusercontent.com/marilializ/Backstage/main/imagens/assistirmaistarde.PNG)

## HISTÓRIA 3:
Permite que o usuário deixa uma resenha sobre o filme.

![História3](imagens/critica.png)
----------------------------------------------------------------------------------------------------------------------------------------------

## Screencast
Você pode acessar ([AQUI](https://youtu.be/MOOjIxs7I2w)) o vídeo explicativo do nosso projeto já desenvolvido em Django, com as três histórias implementadas.

## Backlog no Jira
![Backlog2](https://raw.githubusercontent.com/marilializ/Backstage/main/imagens/backlog2.PNG)

## Quadro no jira
![Quadro2](https://raw.githubusercontent.com/marilializ/Backstage/main/imagens/quadro2.PNG)

----------------------------------------------------------------------------------------------------------------------------------------------

## Bugtracker
Criamos um bugtracker, onde podemos ver a correção de bugs e melhorias que queremos fazer para o Backstage.

![bugtracker1](https://raw.githubusercontent.com/marilializ/Backstage/main/imagens/bugtracker.PNG)

![bugtracker2](https://github.com/user-attachments/assets/b2527ebf-7f4d-4f84-a87d-cb956e232e63)

![bugtracker3](https://github.com/user-attachments/assets/b15621ae-75bc-435f-9b34-0aae779c3ca9)

Bugs corrigídos:

-No Bugtracker2, o código está tentando acessar um campo criado_em que não existe — o nome certo no model é criada_em.

-No Bugtracker3, o Django lança um erro do tipo OperationalError, Isso indica que o banco de dados não possui a tabela backstage_membrocomunidade, que o Django está tentando consultar.
O erro surgiu durante a renderização do template community.html, quando a view backstage.views.comunidade tentou acessar dados do modelo MembroComunidade.

-O template chamado em backstage/views.py (backstage/busca.html) não era compatível com a estrutura de pastas existente, pois o arquivo busca.html não foi encontrado dentro de backstage/templates/backstage/.

-O template chamado em backstage/views.py (backstage/register.html) não era compatível com a estrutura de pastas existente, pois o arquivo register.html não foi encontrado dentro de backstage/templates/backstage/.

-A view salvar_critica em backstage/views.py não era compatível com o fluxo do Django, pois não retornava um objeto HttpResponse, mas sim None.

-O template chamado em backstage/views.py (backstage/login.html) não era compatível com a estrutura de pastas existente, pois o arquivo login.html não foi encontrado dentro de backstage/templates/backstage/.

-Os path definidos em setup/urls.py não incluíam uma rota para o caminho vazio (""), resultando no erro 404 ao acessar http://127.0.0.1:8000/.

-Os path, namespace e views "comunidade" (em backstage/urls.py) não eram compatíveis com o nome do arquivo (community.html)

## Programação em Par
A implementação das histórias foi feita por meio da programação em par. Neste [relatório](https://docs.google.com/document/d/1HIxRn-m3WkP-25n1E8wzRNDGOBeI7m8e7uyD_I04urM/edit?usp=sharing), você pode encontrar mais sobre o esse processo.

</details>

<details>
<summary> 📥 ENTREGA 3</summary>
O objetivo dessa Sprint foi expandir o Backstage com a continuação da implementação das histórias.

## HISTÓRIA 1:
Permite que o usuário pesquise filmes por título, gênero ou autor, facilitando a sua navegação.

![História1](print)
![História1](print)
![História1](print)

## HISTÓRIA 2:
Permite que o usuário veja os principais detalhes de uma série (elenco, duração, classificação...) ao clicar nela.

![História2](print)

## HISTÓRIA 3:
Permite que o usuário seja avisado sobre possíveis spoilers em resenhas alheias e que possa avisar se sua própria resenha tem spoilers.

![História3](print)

## Backlog no Jira
![Backlog2](print)

## Quadro no jira
![Quadro2](print)

## Screencasts
Nessa entrega, realizamos os screencasts de CI/CD com build e deployment automatizado, Testes de Sistema (E2E) Automatizados e do deployment das novas histórias.

[CI/CD](link)
[E2E](link)
[Deployment](link)

## Bugtracker
Uma nova secção foi adicionada ao bugtracker, para o controle de bugs desta entrega.

Open:
PRINT DO BUG TRACKER

Closed:
PRINT DO BUG TRACKER

## Programação em Par
A implementação das histórias foi feita por meio da programação em par. Neste [relatório](https://docs.google.com/document/d/1HIxRn-m3WkP-25n1E8wzRNDGOBeI7m8e7uyD_I04urM/edit?usp=sharing), você pode encontrar mais sobre esse processo.







</details>

<details>
<summary> 🚀 INTEGRANTES  </summary>
  
- Henrique Antunes Calado 
  
- Leonardo Argente

- Louise Pessoa Araújo Medeiros de Souza

- Luis Antônio Godoy Idrissi

- Marília Liz Alves de Lima

- Rafael Pimentel Borba

- Victor Martins Tomaz de Melo
  </details>
