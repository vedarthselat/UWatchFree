const mongoose=require("mongoose"); 
const {Schema}= mongoose;

const toWatchListSchema=new Schema({
    movie_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"movies",
        required:true
    },
    user_id:{
        type:Schema.Types.ObjectId,
        ref:"users",
        required:true
    },
    priority:{
        type:Number,
        required:true
    },
    notes:{
        type:String,
        required:true
    }
});

module.exports=mongoose.model("towatchlist",toWatchListSchema);