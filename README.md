# kitchenwise-plan-storage-service

A microservice that stores and manages each user's saved meal plans. Part of the KitchenWise application — a full-stack microservice architecture for personalized meal planning and local grocery store discovery.

---

## Overview

Once a meal plan has been generated, this service persists it to MongoDB against the authenticated user. Every `/api` route is protected by JWT authentication; the user ID is read from the verified token, so users can only create, read, update, or delete their own plans. Request bodies are validated with Zod before they reach the database.

---

## Tech Stack

- **Runtime:** Node.js 26.x (pinned in `package.json` `engines` for Vercel)
- **Language:** TypeScript
- **Framework:** Express
- **Database:** MongoDB (Mongoose)
- **Validation:** Zod
- **Auth:** JWT (jsonwebtoken)
- **Deployment:** Vercel

---

## API Endpoints

All `/api` routes require an `Authorization: Bearer <token>` header.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check (public) |
| POST | `/api/create-user-meal-plan` | Save a meal plan for the user |
| GET | `/api/get-user-meal-plan` | Retrieve the user's meal plan |
| PATCH | `/api/update-user-meal-plan` | Update the user's meal plan |
| DELETE | `/api/delete-user-meal-plan` | Delete the user's meal plan |

Create and update take the same body: `{ date, mealPlan }` (see the schema below). To save a plan from kitchenwise-meal-plan-service, put its response's `data` object in `mealPlan`. Any `userId`, `_id`, or `__v` in the body is stripped during validation; the user ID always comes from the token.

### Responses

| Route | Success |
|-------|---------|
| create | `201` with the saved document (`_id`, `userId`, `date`, `mealPlan`, `__v`) |
| get | `200` with the saved document, or `200` with `null` if the user has no plan |
| update | `200` with the `{ date, mealPlan }` that was sent, even if the user had no plan to update |
| delete | `200` with MongoDB's result, e.g. `{ "acknowledged": true, "deletedCount": 1 }` |

Errors: `401 { error }` for a missing or invalid token, `400 { message: "Validation failed", errors: [{ path, message }] }` for an invalid body, `500 { message }` for database errors.

The service is meant to hold one plan per user (get, update, and delete take no ID), but create does not yet reject a second plan. If a user creates twice, the other routes act on the first one.

---

## Meal Plan Schema

```typescript
{
  userId: string            // taken from the JWT, not the request body
  date: Date
  mealPlan: {
    id: string
    date: Date
    meals: {
      id: string
      name: "breakfast" | "lunch" | "dinner"
      image?: string
      price?: number
      foods: {
        id: string
        name: string
        calories: number
        protein: number
        carbs: number
        fat: number
        quantity?: string
      }[]
    }[]
  }
}
```

---

## Environment Variables

Create a `.env` file in the root of the project with the following variables:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

`JWT_SECRET` must match the secret used by `user-auth-service`.

---

## Getting Started

### Prerequisites
- Node.js 26.x
- MongoDB connection string (`MONGO_URI`)

### Installation

```bash
git clone https://github.com/GreatDeveloper66/kitchenwise-plan-storage-service.git
cd kitchenwise-plan-storage-service
npm install
```

### Development

```bash
npm run dev    # tsx watch on src/server.ts, http://localhost:3000
```

### Production

```bash
npm run build  # tsc to dist/
npm start      # node dist/server.js
```

---

## Project Architecture

This repository is one of seven components in the KitchenWise application (six backend microservices plus the React frontend):

| Repository | Responsibility |
|---------|---------------|
| [kitchenwise-frontend](https://github.com/GreatDeveloper66/kitchenwise-frontend) | React + TypeScript frontend |
| [user-auth-service](https://github.com/GreatDeveloper66/user-auth-service) | Authentication & JWT management |
| [kitchenwise-diet-profile-service](https://github.com/GreatDeveloper66/kitchenwise-diet-profile-service) | Diet profile storage & management |
| [kitchenwise-meal-plan-service](https://github.com/GreatDeveloper66/kitchenwise-meal-plan-service) | AI-powered meal plan generation |
| **[kitchenwise-plan-storage-service](https://github.com/GreatDeveloper66/kitchenwise-plan-storage-service)** | User meal plan storage |
| [kitchenwise-grocery-service](https://github.com/GreatDeveloper66/kitchenwise-grocery-service) | Grocery store discovery by location (Google Places) |
| [kitchenwise-recipe-service](https://github.com/GreatDeveloper66/kitchenwise-recipe-service) | AI recipe generation |

## LICENSE

See [LICENSE.md](LICENSE.md).
