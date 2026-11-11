# kitchenwise-plan-storage-service

Persists each user's saved meal plan to MongoDB. Branch: `main`. Deployed at https://meal-planner-user-meal-plan-service.vercel.app (old name, do not rename).

Stack: Node.js 20, Express, TypeScript, MongoDB (Mongoose), Zod validation, jsonwebtoken.

## Routes

All `/api` routes require `Authorization: Bearer <token>`. The user ID is read from the verified token.

| Method | Route |
|---|---|
| GET | /health (note: not under /api) |
| POST | /api/create-user-meal-plan |
| GET | /api/get-user-meal-plan |
| PATCH | /api/update-user-meal-plan |
| DELETE | /api/delete-user-meal-plan |

Body shape: `{ date, mealPlan: { id, date, meals: [{ id, name: "breakfast"|"lunch"|"dinner", image?, price?, foods: [{ id, name, calories, protein, carbs, fat, quantity? }] }] } }`.

## Things to confirm before building on this

- Resolved: create and update validate with `CreateMealPlanSchema`, which has no `userId`, so Zod strips any body `userId` (and `_id`, `__v`). The update controller writes only `date` and `mealPlan`. `userId` comes only from the token. Postman bodies that still send `userId` keep working; the field is ignored.
- Get and delete take no ID, so the service currently behaves as one plan per user. Ask Adam before adding multi-plan support.

## Rules

- `JWT_SECRET` must match user-auth-service.
- Env var is `MONGO_URI` here (other services use `MONGODB_URI`). Don't "fix" one without checking Vercel env settings.
