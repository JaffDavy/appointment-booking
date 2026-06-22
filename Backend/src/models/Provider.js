import mongoose from "mongoose";

const providerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    specialty: { type: String, default: "General", trim: true },
    bio: { type: String, trim: true },
  },
  { timestamps: true },
);

export default mongoose.model("Provider", providerSchema);
