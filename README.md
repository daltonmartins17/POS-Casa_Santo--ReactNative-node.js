# 🦐 Casa o Santo — Sistema de Gestão para Restaurante

Sistema POS (Ponto de Venda) profissional para **telemóveis ou tablets**, desenvolvido para o restaurante **Casa o Santo de ANIBAL PORTUGAL GALVÃO**, especializado em mariscos, petiscos e serviço tradicional português, localizado na **Nazaré, Portugal**.

---

## ✨ Funcionalidades

- 🗺️ **Mapa de mesas interativo** — estados visuais (Livre, Ocupada, Reservada, A aguardar pagamento)
- 📝 **Pedidos rápidos** — menu de mariscos, petiscos, bebidas e sobremesas
- 🍳 **Painel da cozinha em tempo real** — KDS com WebSocket
- 💳 **Pagamentos** — Dinheiro, Multibanco e MBWay
- 📊 **Dashboard** — estatísticas e atalhos rápidos
- 👥 **Gestão de utilizadores** — ADMIN e Gerente gerem equipa
- 📦 **Gestão de produtos e mesas** — CRUD completo
- 📱 **Responsivo** — adapta-se a qualquer ecrã (tablet, telemóvel, browser)

---

## 🧰 Stack

| Camada            | Tecnologia                                                                            |
| ----------------- | ------------------------------------------------------------------------------------- |
| **Frontend**      | React Native (Expo), NativeWind (TailwindCSS), React Navigation, Zustand, React Query |
| **Backend**       | Node.js, Express, Prisma ORM, Socket.io                                               |
| **Base de dados** | MySQL                                                                                 |

---

## 🚀 Instalação

### Pré-requisitos

- Node.js 20+
- MySQL 8.0+
- Expo CLI (`npm install -g expo-cli`)

### Backend

```bash
cd backend
.env  # configurar DATABASE_URL
npm install
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
ou
npm start

---
Frontend
cd frontend
npm install
npm start
ou
npx expo start --clear

-----------------

Crie o ficheiro .env dentro da pasta backend com o seguinte conteúdo:

env
DATABASE_URL="mysql://root:12345@localhost:3306/restaurantecasanto"
JWT_SECRET="12345"
PORT=3000
Nota: Altere root e 12345 para o utilizador e password do seu MySQL, e restaurantecasanto para o nome da base de dados que preferir.

2. Instalar dependências e migrar a base de dados
bash
npm install
npx prisma migrate dev --name init
npx prisma db seed

-----------------
estrutura
Casa_O_Santo/
├── README.md
├── backend/
│   ├── .env
│   ├── package.json
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   └── src/
│       ├── server.js
│       ├── app.js
│       ├── config/
│       ├── middleware/
│       ├── modules/
│       │   ├── auth/
│       │   ├── tables/
│       │   ├── menu/
│       │   ├── orders/
│       │   └── users/
│       ├── sockets/
│       └── utils/
└── frontend/
    ├── app.json
    ├── App.js
    ├── babel.config.js
    ├── tailwind.config.js
    └── src/
        ├── api/
        ├── components/
        ├── navigation/
        ├── screens/
        ├── store/
        └── theme/

--------
🔐 Acessos padrão (seed)
Cargo	Email	Password
Administrador	admin@casasanto.pt	123456
Gerente	gerente@casasanto.pt	123456
Cozinheiro	cozinha@casasanto.pt	123456
Empregado	empregado1@casasanto.pt	123456

---------


## ⚠️ Aviso de Segurança

Este projeto é para fins de **demonstração de portfólio**.
As credenciais no seed são fictícias e para uso local.
**Nunca** faça deploy público com estas configurações.

Para produção:
- Use variáveis de ambiente seguras
- Altere o `JWT_SECRET`
- Configure HTTPS
- Use autenticação robusta

-----------

📄 Créditos
Aplicação desenvolvida por Dalton Martins.

Casa o Santo de ANIBAL PORTUGAL GALVÃO — Nazaré, Portugal.
```
