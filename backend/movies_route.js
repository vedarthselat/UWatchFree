const express = require("express");
const router = express.Router();
const multer = require("multer");
const { body, validationResult } = require("express-validator");
const Movie = require("./Schema/movies"); // adjust path if needed
const fetchuser = require("./fetchuser");
const User= require("./Schema/user");

// Configure multer to store image in memory
const storage = multer.memoryStorage();
const upload = multer({ storage });

// POST route to add a movie
router.post(
  "/addMovie",
  fetchuser,
  upload.single("poster"),
  [
    body("homepage", "Homepage is required").notEmpty(),
    body("tagline", "Tagline is required").notEmpty(),
    body("title", "Title is required").notEmpty(),
    body("vote_average", "Vote average is required and must be a number between 0 and 10")
      .notEmpty()
      .isFloat({ min: 0, max: 10 }),
    body("rutime", "Runtime is required and must be numeric")
      .notEmpty()
      .isNumeric(),
    body("genre", "Genre is required").notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Poster image is required." });
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        error: "Only JPG, JPEG, PNG, and WEBP image formats are allowed.",
      });
    }

    const { homepage, tagline, title, vote_average, rutime, genre } = req.body;

    try {
      const user_id = req.user.id;
      const currentUser = await User.findById(user_id).select("-password");
      if (!currentUser) {
        return res.status(401).json({ error: "Please log in with valid credentials" });
      }

      const newMovie = new Movie({
        homepage,
        tagline,
        title,
        vote_average,
        rutime,
        genre,
        user: user_id,
        poster: {
          data: req.file.buffer,
          contentType: req.file.mimetype,
        },
      });

      await newMovie.save();
      res.status(201).json({ message: "Movie added successfully!" });
    } catch (error) {
      if (error.code === 11000) {
        const duplicateField = Object.keys(error.keyPattern)[0];
        return res.status(400).json({
          error: `Duplicate entry: ${duplicateField} must be unique.`,
        });
      }

      console.error("Error adding movie:", error);
      res.status(500).json({ error: "Internal server error." });
    }
  }
);



router.get("/", async (req, res) => {
  try {
    const movies = await Movie.find();
    res.status(200).json(movies);
  } catch (error) {
    console.error("Error fetching movies:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

router.get("/:title", async (req, res) => {
  try {
    const title = req.params.title;

    // First, try exact case-insensitive match
    const exactMatch = await Movie.findOne({ title: { $regex: new RegExp(`^${title}$`, 'i') } });

    if (exactMatch) {
      return res.status(200).json(exactMatch);
    }

    // If no exact match, do a partial match (case-insensitive)
    const partialMatches = await Movie.find({ title: { $regex: title, $options: "i" } });

    if (partialMatches.length === 0) {
      return res.status(404).json({ error: "No matching movies found." });
    }

    return res.status(200).json(partialMatches);
  } catch (error) {
    console.error("Error fetching movie(s):", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

router.get("/id/:id", async (req, res) => {
  try {
    const id = req.params.id;

    // First, try exact case-insensitive match
    const exactMatch = await Movie.findById({ _id: id });

    if (exactMatch) {
      return res.status(200).json(exactMatch);
    }
    else{
      return res.status(404).json({ error: "No matching movies found." });
    }

    // If no exact match, do a partial match (case-insensitive)
  } catch (error) {
    console.error("Error fetching movie:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// DELETE all movies
// router.delete("/all/all", async (req, res) => {
//   try {
//     const result = await Movie.deleteMany({});
//     res.status(200).json({
//       message: "All movies deleted successfully",
//       deletedCount: result.deletedCount
//     });
//   } catch (error) {
//     console.error("Error deleting movies:", error);
//     res.status(500).json({ error: "Internal server error." });
//   }
// });









module.exports = router;
