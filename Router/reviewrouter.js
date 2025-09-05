import express from "express";
import { createReview, getReviewById, getReviews } from "../Controllers/reviewController.js";


const reviewrouter = express.Router();

reviewrouter.post("/", createReview);
reviewrouter.get("/",getReviews);
reviewrouter.get("/:id", getReviewById);
export default reviewrouter;