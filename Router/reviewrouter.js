import express from "express";
import { createReview, deleteReview, getReviewById, getReviews } from "../Controllers/reviewController.js";


const reviewrouter = express.Router();

reviewrouter.post("/", createReview);
reviewrouter.get("/",getReviews);
reviewrouter.get("/:id", getReviewById);
reviewrouter.delete("/", deleteReview);
export default reviewrouter;