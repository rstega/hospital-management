import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Doctor name is required"],
      trim: true,
    },
    department: {
      type: String,
      required: [true, "Department is required"],
      trim: true,
    },
    room: {
      type: String,
      required: [true, "Room number or name is required"],
      trim: true,
    },
    availableSlots: {
      type: [String],
      default: ["08:30 AM", "10:00 AM", "11:30 AM", "02:00 PM", "03:30 PM"],
    },
  },
  { timestamps: true }
);

export const Doctor = mongoose.model("Doctor", doctorSchema);