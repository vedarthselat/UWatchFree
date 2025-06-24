const mongoose = require("mongoose");
const {Schema} = mongoose;

  const movieSchema = new Schema({
      homepage:{
        type:String,
        required:true,
      },
      tagline:{
        type:String,
        required:true,
        unique:true,
      },
      title:{
        type:String,
        required:true,
        unique:true,
      },
      vote_average:{
        type:Number,
        required:true,
      },
      vote_count:{
        type:Number,
        default: 1,
      },
      rutime:{
        type:Number,
        required:true,
      },
      poster: {
        data: Buffer,
        contentType: String
      },
      genre:{
        type:String,
        required:true,
      }
      }); 

      module.exports=mongoose.model("movies",movieSchema);

