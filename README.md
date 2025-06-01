# Documentação do Projeto TaskFlow

# Tecnologias Utilizadas e Processo de Desenvolvimento

## Stack da Aplicação

O projeto TaskFlow foi desenvolvido utilizando a seguinte stack de tecnologias, focada em uma arquitetura client-side com um servidor Node.js simples para servir os arquivos:

* **Frontend**:
    * HTML5
    * CSS3 (para estilização, com arquivos separados para componentes principais como `main.css`, `board.css`, `auth.css`, `admin.css`)
    * JavaScript : Responsável por toda a lógica da aplicação, interatividade do usuário, manipulação do DOM e comunicação com o `localStorage`.
* **Backend (Servidor de Arquivos)**:
    * Node.js: Utilizado para criar um servidor HTTP simples (`server.js`) que serve os arquivos estáticos da aplicação (HTML, CSS, JS).
* **Armazenamento de Dados**:
    * Browser `localStorage`: Utilizado para persistir os dados dos usuários e das tarefas diretamente no navegador do cliente.
* **Controle de Versão**:
    * Git e GitHub.

## Processo de Desenvolvimento e Uso de Inteligência Artificial

* **Documentação Gerada**: A documentação do projeto, incluindo a análise da estrutura, funcionalidades e o mapeamento de requisitos, foi gerada com o auxílio de ferramentas de Inteligência Artificial.
* **Desenvolvimento Frontend**: O desenvolvimento do frontend (HTML, CSS, JavaScript) contou com a assistência de ferramentas de Inteligência Artificial, como funcionalidades de autocompletar e sugestões de código do Cursor. É importante ressaltar que a IA serviu como uma ferramenta de produtividade e auxílio, mas a arquitetura, a lógica principal e a integração dos componentes foram concebidas e implementadas pelo desenvolvedor. A IA não foi responsável pela criação integral do frontend.
* **Backend**: O `server.js` é um script conciso focado em servir arquivos estáticos, utilizando funcionalidades básicas do Node.js.

Este modelo de desenvolvimento híbrido, combinando a expertise do desenvolvedor com as capacidades de aceleração da IA, visou otimizar o tempo de desenvolvimento e a criação da documentação, mantendo o controle e a qualidade do código gerado.

---

## Páginas do CRUD

### 1. Página de Login

* **Funcionalidade**: Permite que usuários existentes acessem a aplicação.
* **Implementação**: `index.html` (estrutura do formulário), `scripts/auth.js` (lógica de login).

    * **Validação básica de campos (e-mail/senha)**:
        * O formulário de login em `index.html` possui campos `email` e `password` marcados como `required`.
        * A função `login` em `scripts/auth.js` verifica se o email e a senha correspondem a um usuário armazenado. Mensagens de erro são exibidas usando `showToast` de `scripts/utils.js` para credenciais inválidas.
    * **Armazenamento de sessão (ex: localStorage)**:
        * Após o login bem-sucedido, os dados do usuário são armazenados no `localStorage` sob a chave `currentUser`.
        * `app.js` verifica `currentUser` para determinar se o usuário está logado e direciona para a visualização apropriada.

---

### 2. Página de Cadastro

* **Funcionalidade**: Permite que novos usuários criem uma conta.
* **Implementação**: `index.html` (estrutura do formulário), `scripts/auth.js` (lógica de registro).

    * **Formulário funcional (nome, e-mail, senha)**:
        * O formulário de registro em `index.html` coleta `email`, `name`, `password`, `birthday` (opcional) e `position` (opcional).
        * A função `register` em `scripts/auth.js` processa esses dados.
    * **Validação de campos (ex: e-mail válido)**:
        * `scripts/auth.js` utiliza `validateEmail` e `validatePassword` de `scripts/utils.js` para verificar o formato do email e o comprimento mínimo da senha antes de tentar o registro.
    * **Manipulação em DOM para exibir avisos de campos ao usuário**:
        * Em `scripts/auth.js`, se a validação de email ou senha falhar durante o registro, mensagens de erro são inseridas diretamente no DOM ao lado dos campos correspondentes (ex: `document.getElementById('register-email').nextElementSibling.textContent = 'Por favor, insira um email válido';`). Os campos também recebem a classe `error`.
    * **Armazenamento no localStorage**:
        * Novos usuários registrados são adicionados a um array de usuários, que é então salvo no `localStorage` sob a chave `users`.
    * **Não aceitar duplicidade de cadastro (dois cadastros iguais)**:
        * A função `register` em `scripts/auth.js` verifica se já existe um usuário com o mesmo email (insensível a maiúsculas/minúsculas) antes de criar um novo cadastro. Se um email duplicado for encontrado, uma notificação é exibida e o cadastro não é realizado.

---

### 3. Página de Listagem

* **Funcionalidade**: Exibe os usuários cadastrados (Painel de Administração) e as tarefas (Quadro Kanban).
* **Implementação**:
    * **Usuários**: `index.html` (estrutura da tabela de admin), `scripts/admin.js` (lógica para renderizar usuários).
    * **Tarefas**: `index.html` (estrutura do quadro), `scripts/board.js` (lógica para renderizar tarefas).

    * **Exibir dados dos cadastrados em uma tabela/listagem**:
        * **Usuários**: A função `renderUsersTable` em `scripts/admin.js` busca todos os usuários com `getAllUsers` de `auth.js` e os exibe em uma tabela no painel de admin, mostrando nome, email, cargo e papel.
        * **Tarefas**: A função `renderTasks` em `scripts/board.js` exibe as tarefas do usuário logado nas colunas "To Do", "In Progress" e "Done".
    * **Botão para editar/excluir registros**:
        * **Usuários**: Na tabela de usuários em `scripts/admin.js`, cada linha de usuário possui botões "Editar" e "Deletar".
            * O botão "Editar" abre um modal (`user-modal`) preenchido com os dados do usuário para edição.
            * O botão "Deletar" remove o usuário (com confirmação), exceto o próprio usuário logado.
        * **Tarefas**: Ao clicar em um cartão de tarefa em `scripts/board.js`, o modal de tarefa (`task-modal`) é aberto para edição. Este modal inclui um botão "Delete" para remover a tarefa.
    * **Filtro ou busca simples dos usuários (ex: por nome)**:
        * **Tarefas**: `app.js` implementa uma funcionalidade de busca na barra de header (`id="search-tasks"`) que filtra os cartões de tarefa exibidos no quadro com base no título ou descrição da tarefa.
        * *Observação: A busca implementada é para tarefas, não diretamente para usuários na tabela de admin.*

---

### 4. Página de Perfil

* **Funcionalidade**: Permite ao usuário logado visualizar e editar suas informações.
* **Implementação**: `index.html` (estrutura do formulário de perfil), `scripts/profile.js` (lógica do perfil).

    * **Mostrar dados do usuário logado**:
        * A função `loadUserProfile` em `scripts/profile.js` obtém o usuário atual de `auth.js` e preenche o formulário de perfil com email (somente leitura), nome, data de nascimento e cargo.
    * **Permitir edição e salvamento no localStorage**:
        * O formulário de perfil permite a edição de nome, data de nascimento e cargo.
        * A função `saveProfileChanges` em `scripts/profile.js` coleta os dados atualizados e usa `updateUser` de `auth.js` para salvar as alterações no `localStorage` (tanto na lista `users` quanto em `currentUser`).

---

### 5. Funcionalidades Gerais do CRUD

O CRUD é implementado para duas entidades principais: **Usuários** e **Tarefas**.

* **Create: Adicionar novos registros**:
    * **Usuários**: Função `register` em `scripts/auth.js` cria novos usuários.
    * **Tarefas**: Ao submeter o formulário no modal de tarefas (`task-modal`) sem um `task-id` preenchido, uma nova tarefa é criada pela função `saveTask` em `scripts/board.js`.
* **Read: Listar registros**:
    * **Usuários**: Função `renderUsersTable` em `scripts/admin.js` lista os usuários.
    * **Tarefas**: Função `renderTasks` em `scripts/board.js` lista as tarefas do usuário.
* **Update: Editar registros**:
    * **Usuários**:
        * Administradores podem editar usuários através do modal de edição em `scripts/admin.js` (função `saveUserChanges` usando `updateUser` de `auth.js`).
        * Usuários podem editar seus próprios perfis em `scripts/profile.js` (função `saveProfileChanges` usando `updateUser` de `auth.js`).
    * **Tarefas**: Ao submeter o formulário no modal de tarefas (`task-modal`) com um `task-id` existente, a tarefa é atualizada pela função `saveTask` em `scripts/board.js`.
* **Delete: Remover registros**:
    * **Usuários**: Administradores podem deletar usuários (com confirmação) através da tabela de usuários em `scripts/admin.js` (usando `deleteUser` de `auth.js`).
    * **Tarefas**: Tarefas podem ser deletadas através do botão "Delete" no modal de tarefas, o que chama a função `deleteTask` em `scripts/board.js`.

---

### 6. Observação sobre o Objeto do Usuário

* O objeto do usuário, conforme definido em `scripts/auth.js` ao registrar ou criar o admin padrão, possui as seguintes características:
    1.  `email` (usado como identificador único para login e para evitar duplicidade)
    2.  `name`
    3.  `password`
    4.  `role` (`admin` ou `user`)
    5.  `birthday` (data de nascimento)
    6.  `position` (cargo)
    7.  `id` (gerado com `Date.now().toString()`)
* O **email** é a característica única verificada durante o registro para evitar duplicidade.

---

## Consumo de API com Fetch

### Página de Consumo de API

* **Funcionalidade**: Importar tarefas de uma API externa.
* **Implementação**: `index.html` (estrutura do modal de importação), `scripts/import.js` (lógica de importação).

    * **Fetch em uma API pública (ex: JSONPlaceholder, ViaCEP)**:
        * A função `importFromApi` em `scripts/import.js` usa `fetch` para buscar dados da API `https://jsonplaceholder.typicode.com/todos`.
    * **Exibição dos dados em tela (lista, cards ou tabela)**:
        * Os dados recebidos da API JSONPlaceholder são processados e transformados em objetos de tarefa.
        * Essas novas tarefas são então salvas usando `saveImportedTasks` que, por sua vez, chama `refreshBoard` de `scripts/board.js`.
        * `refreshBoard` chama `loadTasks` e `renderTasks`, que exibem as tarefas (incluindo as importadas) como cartões no quadro Kanban.
    * **Adicionar uma nova funcionalidade com uso de API**:
        * Além da importação da API JSONPlaceholder, o módulo de importação (`scripts/import.js`) também permite a **importação de tarefas a partir de um arquivo JSON local fornecido pelo usuário**. O usuário seleciona um arquivo, e o conteúdo é lido usando `FileReader`, processado como JSON, validado, e as tarefas são adicionadas ao quadro.

---

