const express = require("express");
const router = express.Router();
const fetchuser = require("./fetchuser");
const { body, validationResult } = require("express-validator");
const CompletedWatchList = require("./Schema/completedWatchList");
const Movie = require("./Schema/movies");
const ToWatchList = require("./Schema/toWatchList");

// Add to completed watchlist
router.post(
  "/:movie_id",
  fetchuser, [
  body("rating", "Rating is required and must be a number between 1 and 10").notEmpty().isFloat({ min: 1, max: 10 }), 
   body("notes", "Notes are required").notEmpty().custom((value) => typeof value === "string") ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const user_id = req.user.id;
    const movie_id = req.params.movie_id;
    const { rating, notes } = req.body;

    // try {
      const exists = await CompletedWatchList.findOne({ user_id, movie_id });
      if (exists) return res.status(400).json({ error: "Already in completed list" });


      const exists2 = await ToWatchList.findOne({ user_id, movie_id });
      if (!exists2) return res.status(400).json({ error: "Not in toWatchList" });
      await ToWatchList.findOneAndDelete({user_id, movie_id});
      const entry = new CompletedWatchList({
        user_id,
        movie_id,
        rating,
        notes,
      });

      await entry.save();

      // Update movie rating
      const movie = await Movie.findById(movie_id);
      if (movie) {
        const {vote_average, vote_count}= movie;
        const newCount = vote_count + 1;
        const newAvg = ((vote_average * vote_count) + Number(rating)) / newCount;
        const result = await Movie.findOneAndUpdate(
          { _id: movie_id },
          { vote_average: newAvg, vote_count: newCount },
          { new: true }
        );
        if(!result) return res.status(404).json({ error: "Movie not found" });
      }



      res.status(200).json({ message: "Added to completedWatchList & rating updated", entry });
    // } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    // }
  }
);

// GET all completed watchlist sorted by rating
router.get("/", fetchuser, async (req, res) => {
  const user_id = req.user.id;
  const { min_times_watched, rating_min } = req.query;

  let filter = { user_id };
  if (min_times_watched) filter.times_watched = { $gte: parseInt(min_times_watched) };
  if (rating_min) filter.rating = { $gte: parseFloat(rating_min) };

  try {
    const list = await CompletedWatchList.find(filter)
      .populate("movie_id")
      .sort({ "movie_id.vote_average": -1 });

    res.status(200).json({ completedWatchList: list });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET times watched for a movie
router.get("/entries/:movie_id/times-watched", fetchuser, async (req, res) => {
  const { movie_id } = req.params;
  try {
    const entry = await CompletedWatchList.findOne({ user_id: req.user.id, movie_id });
    if (!entry) return res.status(404).json({ error: "Movie not found" });

    res.status(200).json({ times_watched: entry.times_watched });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET rating for a movie
router.get("/entries/:movie_id/rating", async (req, res) => {
  const { movie_id } = req.params;
  try {
    const entry = await CompletedWatchList.findOne({ movie_id });
    if (!entry) return res.status(404).json({ error: "Movie not found" });

    res.status(200).json({ rating: entry.rating });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// PATCH rating
router.patch("/entries/:movie_id/rating", fetchuser, async (req, res) => {
  const { rating } = req.body;
  const { movie_id } = req.params;

  if (!rating) return res.status(400).json({ error: "Rating is required" });

  try {
    const entry = await CompletedWatchList.findOneAndUpdate(
      { user_id: req.user.id, movie_id },
      { rating },
      { new: true }
    );

    if (!entry) return res.status(404).json({ error: "Entry not found" });

    // Update movie rating average
    const movie = await Movie.findById(movie_id);
    if (movie) {
      const newCount = movie.vote_count + 1;
      const newAvg = ((movie.vote_average * movie.vote_count) + Number(rating)) / newCount;
      movie.vote_average = newAvg;
      movie.vote_count = newCount;
      await movie.save();
    }

    res.status(200).json({ message: "Rating updated", entry });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// PATCH times_watched
router.patch("/entries/:movie_id/times-watched", fetchuser, async (req, res) => {
  const { movie_id } = req.params;

  try {
    const entry = await CompletedWatchList.findOneAndUpdate(
      { user_id: req.user.id, movie_id },
      {
        $inc: { times_watched: 1 },
        last_watched: Date.now(),
      },
      { new: true }
    );

    if (!entry) return res.status(404).json({ error: "Entry not found" });

    res.status(200).json({ message: "Watch count incremented", entry });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE entry
router.delete("/:movie_id", fetchuser, async (req, res) => {
  const { movie_id } = req.params;
  try {
    const entry = await CompletedWatchList.findOneAndDelete({ user_id: req.user.id, movie_id });
    if (!entry) return res.status(404).json({ error: "Entry not found" });

    res.status(200).json({ message: "Deleted from completedWatchList", entry });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
