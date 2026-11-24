import { Appointment } from "../models/Appointment.js";
import { Doctor } from "../models/Doctor.js";
import { Patient } from "../models/Patient.js";

export const getAppointments = async (req, res) => {
  try {
    const filter = {};
    if (req.query.doctorId) filter.doctor = req.query.doctorId;
    if (req.query.date) filter.date = req.query.date;
    if (req.query.status) filter.status = req.query.status;

    const appointments = await Appointment.find(filter)
      .populate("patient", "fullName phone email age gender")
      .populate("doctor", "name department room")
      .sort({ date: 1, timeSlot: 1 });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createAppointment = async (req, res) => {
  try {
    const { fullName, phone, email, age, gender, doctorId, date, timeSlot, reason } = req.body;

    if (!fullName || !phone || !doctorId || !date || !timeSlot) {
      return res.status(400).json({
        error: "fullName, phone, doctorId, date, and timeSlot are required.",
      });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ error: "Selected doctor was not found." });
    }

    // Check active conflict before writing
    const existingBooking = await Appointment.findOne({
      doctor: doctorId,
      date: date.trim(),
      timeSlot: timeSlot.trim(),
      status: "Scheduled",
    });

    if (existingBooking) {
      return res.status(409).json({
        error: "That time slot is already booked for this doctor on the selected date.",
      });
    }

    // Reuse patient record by phone if already registered
    let patient = await Patient.findOne({ phone: phone.trim() });
    if (!patient) {
      patient = await Patient.create({
        fullName,
        phone,
        email,
        age,
        gender,
      });
    }

    const appointment = await Appointment.create({
      patient: patient._id,
      doctor: doctor._id,
      department: doctor.department,
      date: date.trim(),
      timeSlot: timeSlot.trim(),
      reason,
    });

    const populatedAppointment = await appointment.populate([
      { path: "patient", select: "fullName phone email age gender" },
      { path: "doctor", select: "name department room" },
    ]);

    res.status(201).json(populatedAppointment);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        error: "That time slot is already booked for this doctor on the selected date.",
      });
    }
    res.status(400).json({ error: error.message });
  }
};

export const cancelAppointment = async (req, res) => {
  try {
    const updated = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: "Cancelled" },
      { new: true, runValidators: true }
    )
      .populate("patient", "fullName phone email")
      .populate("doctor", "name department room");

    if (!updated) {
      return res.status(404).json({ error: "Appointment not found." });
    }

    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};