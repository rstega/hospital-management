import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: [true, "Patient reference is required"],
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: [true, "Doctor reference is required"],
    },
    department: {
      type: String,
      required: [true, "Department is required"],
      trim: true,
    },
    date: {
      type: String,
      required: [true, "Appointment date is required"], // e.g., "2026-11-25"
      trim: true,
    },
    timeSlot: {
      type: String,
      required: [true, "Time slot is required"], // e.g., "10:00 AM"
      trim: true,
    },
    reason: {
      type: String,
      trim: true,
      default: "General Consultation",
    },
    status: {
      type: String,
      enum: ["Scheduled", "Completed", "Cancelled"],
      default: "Scheduled",
    },
  },
  { timestamps: true }
);

// Prevent two active ("Scheduled") appointments for the same doctor, date, and timeSlot
appointmentSchema.index(
  { doctor: 1, date: 1, timeSlot: 1 },
  { unique: true, partialFilterExpression: { status: "Scheduled" } }
);

export const Appointment = mongoose.model("Appointment", appointmentSchema);