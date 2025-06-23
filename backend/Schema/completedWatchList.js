const mongoose = require("mongoose");
const { Schema } = mongoose;


const completedWatchListSchema = new Schema({
    movie_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "movies",
        required: true
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    rating: {
        type: Number,
        required: true
    },
    notes: {
        type: String,
        required: true
    },
    initially_watched:{
        type:Date,
        required:true,
        default:Date.now,
    },
    last_watched:{
        type:Date,
        required:true,
        default:Date.now
    },
    times_watched:{
        type:Number,
        required:true,
        default:1,
    }
});

module.exports=mongoose.model("completedwatchlist",completedWatchListSchema);