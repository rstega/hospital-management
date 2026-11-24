import { Doctor } from "../models/Doctor.js";

export const getDoctors = async (req, res) => {
  try {
    const filter = {};
    if (req.query.department) {
      filter.department = req.query.department.trim();
    }

    const doctors = await Doctor.find(filter).sort({ name: 1 });
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createDoctor = async (req, res) => {
  try {
    const { name, department, room, availableSlots } = req.body;
    const doctor = await Doctor.create({
      name,
      department,
      room,
      ...(Array.isArray(availableSlots) && availableSlots.length > 0
        ? { availableSlots }
        : {}),
    });
    res.status(201).json(doctor);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};