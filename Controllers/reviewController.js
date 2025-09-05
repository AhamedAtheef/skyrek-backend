import Review from "../models/review.js";



export const createReview = async (req, res) => {
  try {
    let { name, email, rating, comment } = req.body; // use let instead of const
    name = name.toUpperCase(); // now safe

    const review = new Review({
      name,
      email,
      rating: Number(rating), // ensure rating is a number
      comment,
    });

    await review.save();
    res.status(201).json(review);
  } catch (err) {
    console.error("Error creating review:", err); // log for debugging
    res.status(500).json({ message: err.message });
  }
};


export const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//
export const getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }
    res.json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};