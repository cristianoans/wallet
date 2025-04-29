# Wallet - Sistema de Transações Financeiras

Este projeto é uma aplicação **full-stack** para gerenciar transações financeiras, com um backend em **NestJS** e um frontend em **Next.js**, conectados a um banco de dados **PostgreSQL**.  
Ele foi desenvolvido como parte de um desafio técnico, com foco em **segurança**, **escalabilidade** e **boas práticas de desenvolvimento**.

---

## 📖 Sobre o Projeto

O Wallet é uma plataforma que permite aos usuários realizar transações financeiras como **depósitos**, **transferências** e **reversões de transações**, além de visualizar **saldo** e o **histórico de transações**.

O projeto foi estruturado para atender aos seguintes requisitos:

- **Backend**: API RESTful com autenticação JWT, rotas protegidas e tratamento robusto de erros.
- **Frontend**: Interface web moderna usando Next.js com Server Actions.
- **Docker**: Ambiente padronizado com Docker Compose.
- **Testes**: Testes unitários para backend usando Jest e Supertest.
- **Logs**: Sistema de rotação de logs no backend.

---

## 🚀 Tecnologias Utilizadas

### Backend
- **NestJS**: Framework Node.js modular.
- **TypeORM**: ORM para integração com PostgreSQL.
- **PostgreSQL**: Banco de dados relacional.
- **JWT**: Autenticação segura via tokens.
- **Winston**: Logging estruturado e rotação de logs (`winston-daily-rotate-file`).
- **Swagger**: Documentação interativa da API (`/api`).
- **Jest**: Testes unitários e mocks.
- **Supertest**: Testes de integração de APIs.
- **TypeScript**: Tipagem estática.

### Frontend
- **Next.js 15**: Framework React com Server Actions.
- **React 19**: Construção de interfaces reativas.
- **Tailwind CSS 4**: Estilização rápida e responsiva.
- **Lucide Icons**: Conjunto de ícones leves e modernos.
- **Server Actions**: Comunicação segura cliente-servidor.
- **TypeScript**: Segurança de tipos.

### Infraestrutura
- **Docker**: Containerização dos serviços.
- **Docker Compose**: Orquestração dos containers (Postgres, Backend, Frontend).

---

## 🧪 Funcionalidades

### Backend
- ✅ Rota de saúde da API (`/health`).
- ✅ Registro e login de usuários com JWT.
- ✅ Rotas protegidas para operações financeiras.
- ✅ Gerenciamento de transações: depósito, transferência e reversão.
- ✅ Consulta paginada do histórico de transações.
- ✅ Consulta de saldo da carteira.
- ✅ Documentação automática com Swagger.
- ✅ Logs estruturados e rotacionados.
- ✅ Testes unitários e de integração.

### Frontend
- ✅ Login e registro de usuários.
- ✅ Exibição do saldo atual.
- ✅ Listagem paginada das transações.
- ✅ Realização de depósitos.
- ✅ Transferências entre usuários.
- ✅ Reversão de transações (confirmação via formulário).
- ✅ Logout.
- ✅ Interface moderna e responsiva.

---

## 🐳 Configuração com Docker

O projeto utiliza **Docker Compose** para rodar todos os serviços integrados:

| Serviço   | Descrição                  | Porta |
|-----------|-----------------------------|-------|
| postgres  | Banco de dados PostgreSQL    | 5432  |
| backend   | API NestJS                   | 3000  |
| frontend  | Interface Next.js            | 3001  |

---

## ⚙️ Pré-requisitos

- Docker
- Docker Compose
- (Opcional) Node.js, para desenvolvimento local sem Docker.

---

## 🚀 Como Rodar o Projeto

1. Clone o repositório:

git clone https://github.com/cristianoans/wallet

2. Navegue até a raiz do projeto e rode:

docker-compose up --build -d

O projeto ficará disponível em: http://localhost:3001

📄 Licença
Este projeto foi desenvolvido para fins de estudo e demonstração profissional.