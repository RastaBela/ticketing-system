# 🎟️ Ticketing System - Microservices Architecture

This is a full-featured microservices-based ticketing system built with Node.js, Express, TypeScript, Docker, NATS JetStream, and Prisma. It supports user management, authentication, event creation, booking, payments, and email notifications.

---

## Services Included

### 1. **users-service**

- Handles user CRUD operations.
- Roles: `ADMIN`, `CLIENT`, `ORGANIZER`.
- Publishes events to NATS: `user.created`, `user.updated`, `user.deleted`.

### 2. **auth-service**

- Handles user login.
- Listens to user events to sync auth DB.
- Returns JWT token.

### 3. **events-service**

- Handles creation and management of events.
- Publishes `event.created`, `event.updated`, `event.deleted`.

### 4. **bookings-service**

- Handles user bookings.
- Listens to event events for syncing.
- Publishes `booking.created`.

### 5. **payments-service**

- Simulates payments.
- Publishes `payment.completed`.
- Can be triggered via POST `/api/payments`.

### 6. **notifications-service**

- Listens to `booking.created`.
- Sends confirmation emails via MailDev.

### 7. **nginx (Load Balancer)**

- Routes all `/api/*` requests to appropriate services.
- Accessible on port `80`.

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/ticketing-system.git
cd ticketing-system
```

### 2. Create `.env` file at the root

```env
JWT_SECRET=your_jwt_secret

# USERS SERVICE
DATABASE_URL_USERS_SERVICE=mysql://user:password@mysql-ticketing-users:3306/ticketing_users
DATABASE_NAME_USERS_SERVICE=ticketing_users
DATABASE_USER_USERS_SERVICE=user
DATABASE_PASSWORD_USERS_SERVICE=password
DATABASE_ROOT_PASSWORD_USERS_SERVICE=rootpassword

# AUTH SERVICE
DATABASE_URL_AUTH_SERVICE=mysql://user:password@mysql-ticketing-auth:3306/ticketing_auth
DATABASE_NAME_AUTH_SERVICE=ticketing_auth
DATABASE_USER_AUTH_SERVICE=user
DATABASE_PASSWORD_AUTH_SERVICE=password
DATABASE_ROOT_PASSWORD_AUTH_SERVICE=rootpassword

# EVENTS SERVICE
DATABASE_URL_EVENTS_SERVICE=mysql://user:password@mysql-ticketing-events:3306/ticketing_events
DATABASE_NAME_EVENTS_SERVICE=ticketing_events
DATABASE_USER_EVENTS_SERVICE=user
DATABASE_PASSWORD_EVENTS_SERVICE=password
DATABASE_ROOT_PASSWORD_EVENTS_SERVICE=rootpassword

# BOOKINGS SERVICE
DATABASE_URL_BOOKINGS_SERVICE=mysql://user:password@mysql-ticketing-bookings:3306/ticketing_bookings
DATABASE_NAME_BOOKINGS_SERVICE=ticketing_bookings
DATABASE_USER_BOOKINGS_SERVICE=user
DATABASE_PASSWORD_BOOKINGS_SERVICE=password
DATABASE_ROOT_PASSWORD_BOOKINGS_SERVICE=rootpassword
```

### 3. Start the project

```bash
docker compose up -d --build
```

### 4. Access the system

| Component          | URL                              |
| ------------------ | -------------------------------- |
| NGINX API Gateway  | `http://localhost/api/...`       |
| Swagger (Users)    | `http://localhost:5001/api-docs` |
| Swagger (Auth)     | `http://localhost:5002/api-docs` |
| Swagger (Events)   | `http://localhost:5003/api-docs` |
| Swagger (Bookings) | `http://localhost:5004/api-docs` |
| Swagger (Payments) | `http://localhost:5005/api-docs` |
| MailDev UI         | `http://localhost:1080`          |

---

## Features

- JWT Authentication & Role-based Authorization
- Full CRUD for Users, Events, Bookings
- JetStream-powered messaging (reliable & persistent)
- Confirmation Emails with MailDev
- Dockerized services with isolated DBs
- Load balancing via NGINX
- Swagger documentation for all APIs

---

## Testing

Basic unit tests are included per service (mostly on controllers).
Run tests in any service like:

```bash
cd users-service
npm test
```

---

## Tech Stack

- **Backend**: Node.js, Express, TypeScript
- **Database**: MySQL + Prisma ORM
- **Auth**: JWT
- **Messaging**: NATS + JetStream
- **Email**: Nodemailer + MailDev
- **Containerization**: Docker, Docker Compose
- **Docs**: Swagger (OpenAPI 3)

---

> Ce projet suit une architecture microservices entièrement découplée avec communication via événements, conçu pour être facilement testable et déployable.
