const express = require("express");
const router= express.Router();
const fetchuser= require("./fetchuser");
const {body, validationResult} = require("express-validator");
const Movie= require("./Schema/movies");
const CompletedWatchList= require("./Schema/completedWatchList");
const ToWatchList= require("./Schema/toWatchList");
const User= require("./Schema/user");

// POST /towatchlist/:movie_id
router.post(
    "/:movie_id",
    fetchuser,
    [
      body("priority", "Priority must be a number between 1 and 10").isInt({ min: 1, max: 10 }).notEmpty(),
      body("notes", "Notes are required").notEmpty(),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
  
      const movie_id = req.params.movie_id;
      const user_id = req.user.id;
      const { priority, notes } = req.body;
  
      try {
        const movieExists = await Movie.findById(movie_id);
        if (!movieExists) {
          return res.status(404).json({ error: "Movie not found" });
        }
  
        const completedEntry = await CompletedWatchList.findOne({ movie_id, user_id });
        if (completedEntry) {
          return res.status(200).json({
            message: "Movie already exists in completed watchlist — skipping towatchlist.",
          });
        }
  
        const existingEntry = await ToWatchList.findOne({ movie_id, user_id });
        if (existingEntry) {
          return res.status(200).json({
            message: "Movie already exists in your to-watch list.",
            entry: existingEntry,
          });
        }
  
        const entry = new ToWatchList({
          movie_id,
          user_id,
          priority,
          notes,
        });
  
        await entry.save();
        res.status(201).json({ message: "Movie added to watchlist", entry });
  
      } catch (error) {
        console.error("Error adding to watchlist:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    }
  );



router.get("/", fetchuser, async (req, res) => {
  try {
    const user_id = req.user.id;
    const user = await User.findById(user_id).select("-password");
    if (!user) {
      return res.status(401).json({ error: "Please log in with valid credentials" });
    }

    // Get to-watch list with movie details
    const toWatchList = await ToWatchList.find({ user_id })
      .populate("movie_id") 
      .sort({ priority: 1 }); 

    res.status(200).json(toWatchList);
  } catch (error) {
    console.error("Error fetching toWatchList:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});




// DELETE /towatchlist/:movie_id
router.delete("/:movie_id", fetchuser, async (req, res) => {
  const movie_id = req.params.movie_id;
  const user_id = req.user.id;

  try {
    const user=await User.findById(user_id);
    if(!user){
      return res.status(401).json({error: "Please log in with valid credentials"});
    }
    const entry = await ToWatchList.findOneAndDelete({ movie_id, user_id });

    if (!entry) {
      return res.status(404).json({ error: "Movie not found in your watchlist" });
    }

    res.status(200).json({ message: "Movie removed from your watchlist", entry });
  } catch (error) {
    console.error("Error deleting movie from watchlist:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /towatchlist/all - Deletes all entries from the ToWatchList collection
router.delete("/all/all", async (req, res) => {
  try {
    const result = await ToWatchList.deleteMany({});
    res.status(200).json({
      message: "All to-watch list entries deleted successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error deleting all to-watch list entries:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});




  

module.exports=router;