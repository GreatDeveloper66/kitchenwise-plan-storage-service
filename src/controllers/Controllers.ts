import { Request, Response } from "express";
import { UserMealPlanModel } from "../models/Models.js";
import { connectDB } from "../config/db.js";

// ObjectIds start with a creation timestamp, so sorting by _id descending puts the newest plan first.
const NEWEST_FIRST = { _id: -1 } as const;

export const createUserMealPlan = async (req: Request, res: Response) => {
  try {
    await connectDB();
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Server error while connecting to database",
    });
  }
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized: missing userId",
      });
    }

    const mealPlanData = req.body;

    const created = await UserMealPlanModel.create({
      ...mealPlanData,
      userId, // 🔥 injected from token, not client
    });

    return res.status(201).json(created);
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: "Server error while creating meal plan",
    });
  }
};

export const getUserMealPlan = async (req: Request, res: Response) => {
   try {
    await connectDB();
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Server error while connecting to database",
    });
  }
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized: missing userId",
      });
    }

    // A user can save several plans; get, update, and delete act on the newest.
    const mealPlan = await UserMealPlanModel.findOne({ userId }).sort(NEWEST_FIRST);

    return res.status(200).json(mealPlan);
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: "Server error while getting meal plan",
    });
  }
};

export const deleteUserMealPlan = async (req: Request, res: Response) => {
   try {
    await connectDB();
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Server error while connecting to database",
    });
  }
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized: missing userId",
      });
    }

    const deleted = await UserMealPlanModel.findOneAndDelete({ userId }, { sort: NEWEST_FIRST });

    // Same shape as Mongo's deleteOne result, which this route returned before.
    return res.status(200).json({ acknowledged: true, deletedCount: deleted ? 1 : 0 });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: "Server error while deleting meal plan",
    });
  }
};

export const updateUserMealPlan = async (req: Request, res: Response) => {
   try {
    await connectDB();
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Server error while connecting to database",
    });
  }
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized: missing userId",
      });
    }

    // Only the plan fields are updatable; userId always comes from the token.
    const { date, mealPlan } = req.body;
    const mealPlanData = { date, mealPlan };

    await UserMealPlanModel.findOneAndUpdate(
      { userId },
      mealPlanData,
      { sort: NEWEST_FIRST }
    );

    return res.status(200).json(mealPlanData);
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: "Server error while updating meal plan",
    });
  }
};