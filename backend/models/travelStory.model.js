import mongoose, { Schema } from "mongoose"

const travelStorySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  story: {
    type: String,
    required: true,
  },
  visitedLocation: {
    type: [String],
    default: [],
  },
  isFavourite: {
    type: Boolean,
    default: false,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdOn: {
    type: Date,
    default: Date.now,
  },
  imageUrl: {
    type: String,
    default: "",
    required: true,
  },
  visitedDate: {
    type: Date,
    require: true,
  },
})

const travelStory = mongoose.model("travelStory", travelStorySchema)

export default travelStory




