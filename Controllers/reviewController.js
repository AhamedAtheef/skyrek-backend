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

export const deleteReview = async (req, res) => {
  try {
    const { email, name } = req.body;
    console.log(email, name);

    if (!email || !name) {
      return res.status(400).json({ message: "Email and name are required" });
    }

    // Convert name to uppercase to match the stored format
    const deletedReview = await Review.findOneAndDelete({ 
      email, 
      name: name.toUpperCase() 
    });

    if (!deletedReview) {
      return res.status(404).json({ message: "Review not found" });
    }

    res.json({ message: "Review deleted successfully", review: deletedReview });
    console.log("Deleted review:", deletedReview);
  } catch (err) {
    console.error("Error deleting review:", err);
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