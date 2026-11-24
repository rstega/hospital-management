import { useState } from "react";

const DEFAULT_SLOTS = "08:30 AM, 10:00 AM, 11:30 AM, 02:00 PM, 03:30 PM";

const initialDoctorForm = {
  name: "",
  department: "",
  room: "",
  slotsText: DEFAULT_SLOTS,
};

export default function AddDoctorForm({ onCreateDoctor, creating }) {
  const [open, setOpen] = useState(false);
  const [doctorForm, setDoctorForm] = useState(initialDoctorForm);

  function handleChange(e) {
    const { name, value } = e.target;
    setDoctorForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const availableSlots = doctorForm.slotsText
      .split(",")
      .map((slot) => slot.trim())
      .filter(Boolean);

    const created = await onCreateDoctor({
      name: doctorForm.name.trim(),
      department: doctorForm.department.trim(),
      room: doctorForm.room.trim(),
      availableSlots:
        availableSlots.length > 0
          ? availableSlots
          : DEFAULT_SLOTS.split(",").map((s) => s.trim()),
    });

    if (created) {
      setDoctorForm(initialDoctorForm);
      setOpen(false);
    }
  }

  return (
    <div
      style={{
        border: "1px solid #d1d5db",
        borderRadius: 6,
        padding: "0.75rem 1rem",
        marginBottom: "1.25rem",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <strong>Hospital Doctors Management</strong>
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          style={{ padding: "0.35rem 0.75rem", cursor: "pointer" }}
        >
          {open ? "Close Form" : "+ Add Doctor"}
        </button>
      </div>

      {open && (
        <form
          onSubmit={handleSubmit}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "0.75rem",
            marginTop: "0.85rem",
          }}
        >
          <label>
            Doctor Name
            <input
              type="text"
              name="name"
              value={doctorForm.name}
              onChange={handleChange}
              placeholder="e.g., Dr. Abel Mekonnen"
              required
              style={{
                display: "block",
                width: "100%",
                padding: "0.45rem",
                marginTop: 4,
              }}
            />
          </label>

          <label>
            Department
            <input
              type="text"
              name="department"
              value={doctorForm.department}
              onChange={handleChange}
              placeholder="e.g., Pediatrics"
              required
              style={{
                display: "block",
                width: "100%",
                padding: "0.45rem",
                marginTop: 4,
              }}
            />
          </label>

          <label>
            Room
            <input
              type="text"
              name="room"
              value={doctorForm.room}
              onChange={handleChange}
              placeholder="e.g., Room 204"
              required
              style={{
                display: "block",
                width: "100%",
                padding: "0.45rem",
                marginTop: 4,
              }}
            />
          </label>

          <label>
            Available Slots (comma-separated)
            <input
              type="text"
              name="slotsText"
              value={doctorForm.slotsText}
              onChange={handleChange}
              style={{
                display: "block",
                width: "100%",
                padding: "0.45rem",
                marginTop: 4,
              }}
            />
          </label>

          <div style={{ gridColumn: "1 / -1" }}>
            <button
              type="submit"
              disabled={creating}
              style={{ padding: "0.55rem 1rem", cursor: "pointer" }}
            >
              {creating ? "Saving Doctor..." : "Save Doctor"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}