# QuickVend

Full-stack ecommerce platform — Spring Boot 3.2 + React 19.

## Tech Stack

**Backend:** Java 17, Spring Boot 3.2, Spring Security, JWT, JPA/Hibernate, PostgreSQL, Razorpay, iText PDF, Swagger

**Frontend:** React 19, Vite 8, Redux Toolkit, Tailwind CSS 4, Recharts

**DevOps:** Docker Compose, NGINX, Vercel, Render, GitHub Actions

## Features

- Auth with JWT (register / login)
- Product catalog — pagination, search, category/price filter, sorting
- Shopping cart — add, update, remove, clear
- Wishlist
- Checkout — COD & Razorpay (card / UPI)
- Coupon codes with % discount
- Order tracking — Pending → Confirmed → Shipped → Delivered
- Cancel orders (auto restores stock)
- PDF invoice download
- Email confirmation (async, skips if unconfigured)
- Product reviews with star ratings
- Admin dashboard — revenue bar chart + order status pie (Recharts)
- Admin CRUD — products, categories, orders, coupons, users
- Dark mode, mobile responsive
- API docs at `/swagger-ui.html`

## Prebuilt Users

| Role     | Email             | Password  |
|----------|-------------------|-----------|
| Admin    | admin@shop.com    | admin123  |
| Customer | user@shop.com     | user123   |

Demo includes 12 products in 3 categories.

## Run Locally (Docker)

```bash
git clone <your-repo-url>
cd QuickVend
docker compose up --build
```

Visit http://localhost:5173

## Run Locally (Manual)

**Prerequisites:** Java 17+, Node.js 22+, PostgreSQL 16+

```bash
# Backend
cd backend
mvn spring-boot:run
# → http://localhost:8081
# → Swagger: http://localhost:8081/swagger-ui.html

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

## Deployment

- **Frontend** → Vercel (auto-deploys from GitHub)
- **Backend** → Render (Docker, auto-deploys from GitHub)
- **Database** → Render PostgreSQL (free tier)

> **Note:** Render's free tier sleeps after 15 min idle. First request after sleep takes ~30s to wake.

## Project Structure

```
QuickVend/
├── backend/               # Spring Boot
│   ├── src/main/java/     # controllers, services, repos, entities
│   ├── src/main/resources/ # application.yml
│   ├── src/test/java/     # unit tests (JUnit 5 + Mockito)
│   └── Dockerfile
├── frontend/              # React
│   ├── src/pages/         # Home, Products, Cart, Orders, Admin...
│   ├── src/components/    # Navbar, Spinner, etc.
│   ├── src/store/         # Redux slices
│   └── Dockerfile
├── docker-compose.yml     # postgres + backend + frontend
└── render.yaml
```

## CI/CD

On every push to `main` — GitHub Actions runs backend tests (`mvn test`) and frontend build (`npm run build`).
