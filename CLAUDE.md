# kitchenwise-plan-storage-service

Persists each user's saved meal plan to MongoDB. Branch: `main`. Deployed at https://meal-planner-user-meal-plan-service.vercel.app (old name, do not rename).

Stack: Node.js 26.x (`engines` in `package.json`; Vercel dropped 20.x), Express, TypeScript, MongoDB (Mongoose), Zod validation, jsonwebtoken. Routes in `src/app.ts`, auth and validation middleware in `src/middleware/Middleware.ts`, Zod schemas in `src/schemas/Schemas.ts`, Mongoose model in `src/models/Models.ts`.

## Routes

All `/api` routes require `Authorization: Bearer <token>` (enforced by `authenticationMiddleware` on `/api`). The user ID is read from the token's `id` claim.

| Method | Route | Success response |
|---|---|---|
| GET | / | text "Hello, World!" |
| GET | /health (not under /api) | `{ status, timestamp }` |
| POST | /api/create-user-meal-plan | 201, saved document |
| GET | /api/get-user-meal-plan | 200, saved document or `null` |
| PATCH | /api/update-user-meal-plan | 200, echoes `{ date, mealPlan }` even if nothing matched |
| DELETE | /api/delete-user-meal-plan | 200, Mongo `{ acknowledged, deletedCount }` |

Body shape (create and update, `CreateMealPlanSchema`): `{ date, mealPlan: { id, date, meals: [{ id, name: "breakfast"|"lunch"|"dinner", image?, price?, foods: [{ id, name, calories, protein, carbs, fat, quantity? }] }] } }`. `mealPlan` is the `data` object from kitchenwise-meal-plan-service's `{ success, data }` response, not the whole response.

Errors: 401 `{ error }` (auth), 400 `{ message, errors: [{ path, message }] }` (Zod), 500 `{ message }`.

Env: `MONGO_URI`, `JWT_SECRET`, optional `PORT` (default 3000).

## Notes

- `userId` comes only from the token. Zod strips any body `userId`, `_id`, or `__v`, and update writes only `date` and `mealPlan`. Postman bodies that still send those fields keep working.
- Get, update, and delete take no ID, so the intended model is one plan per user. Create does not enforce this yet; a second create makes a duplicate and the other routes act on the first match. Ask Adam before adding multi-plan support.

## Rules

- `JWT_SECRET` must match user-auth-service.
- user-auth-service and kitchenwise-diet-profile-service also read `MONGO_URI`. Check the Vercel env settings before renaming it.
