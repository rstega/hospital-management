import { useEffect, useMemo, useState } from "react";
import {
  cancelAppointment,
  createAppointment,
  createDoctor,
  fetchAppointments,
  fetchDoctors,
} from "./services/api";

const DEFAULT_SLOTS = "08:30 AM, 10:00 AM, 11:30 AM, 02:00 PM, 03:30 PM";

const initialForm = {
  doctorId: "",
  date: new Date().toISOString().split("T")[0],
  timeSlot: "",
  fullName: "",
  phone: "",
  email: "",
  age: "",
  gender: "Male",
  reason: "General Consultation",
};

const initialDoctorForm = {
  name: "",
  department: "",
  room: "",
  slotsText: DEFAULT_SLOTS,
};

export default function App() {
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showAddDoctor, setShowAddDoctor] = useState(false);
  const [doctorForm, setDoctorForm] = useState(initialDoctorForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [creatingDoctor, setCreatingDoctor] = useState(false);
  const [message, setMessage] = useState(null);

  async function loadInitialData() {
    try {
      setLoading(true);
      const [docs, appts] = await Promise.all([
        fetchDoctors(),
        fetchAppointments(),
      ]);
      const safeDocs = Array.isArray(docs) ? docs : [];
      const safeAppts = Array.isArray(appts) ? appts : [];
      setDoctors(safeDocs);
      setAppointments(safeAppts);

      if (safeDocs.length > 0) {
        const firstDoc = safeDocs[0];
        setForm((prev) => ({
          ...prev,
          doctorId: prev.doctorId || firstDoc._id,
          timeSlot: prev.timeSlot || firstDoc.availableSlots?.[0] || "",
        }));
      }
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInitialData();
  }, []);

  const departments = useMemo(() => {
    const unique = new Set(doctors.map((doc) => doc.department).filter(Boolean));
    return ["All", ...Array.from(unique)];
  }, [doctors]);

  const filteredDoctors = useMemo(() => {
    if (selectedDepartment === "All") return doctors;
    return doctors.filter((doc) => doc.department === selectedDepartment);
  }, [doctors, selectedDepartment]);

  const selectedDoctor = useMemo(
    () => doctors.find((d) => d._id === form.doctorId) || null,
    [doctors, form.doctorId]
  );

  const bookedSlots = useMemo(() => {
    return new Set(
      appointments
        .filter(
          (appt) =>
            appt.status === "Scheduled" &&
            (appt.doctor?._id || appt.doctor) === form.doctorId &&
            appt.date === form.date
        )
        .map((appt) => appt.timeSlot)
    );
  }, [appointments, form.doctorId, form.date]);

  const filteredAppointments = useMemo(() => {
    if (statusFilter === "All") return appointments;
    return appointments.filter((appt) => appt.status === statusFilter);
  }, [appointments, statusFilter]);

  function handleDepartmentChange(dept) {
    setSelectedDepartment(dept);
    const matchingDoctors =
      dept === "All"
        ? doctors
        : doctors.filter((doc) => doc.department === dept);

    const nextDoc = matchingDoctors[0] || null;
    const nextBookedSlots = nextDoc
      ? new Set(
          appointments
            .filter(
              (appt) =>
                appt.status === "Scheduled" &&
                (appt.doctor?._id || appt.doctor) === nextDoc._id &&
                appt.date === form.date
            )
            .map((appt) => appt.timeSlot)
        )
      : new Set();

    const nextSlot =
      nextDoc?.availableSlots?.find((slot) => !nextBookedSlots.has(slot)) ||
      nextDoc?.availableSlots?.[0] ||
      "";

    setForm((prev) => ({
      ...prev,
      doctorId: nextDoc ? nextDoc._id : "",
      timeSlot: nextSlot,
    }));
  }

  function handleDoctorChange(doctorId) {
    const doc = doctors.find((d) => d._id === doctorId);
    const firstOpenSlot =
      doc?.availableSlots?.find((slot) => !bookedSlots.has(slot)) ||
      doc?.availableSlots?.[0] ||
      "";
    setForm((prev) => ({
      ...prev,
      doctorId,
      timeSlot: firstOpenSlot,
    }));
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleDoctorFormChange(e) {
    const { name, value } = e.target;
    setDoctorForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleAddDoctorSubmit(e) {
    e.preventDefault();
    setMessage(null);

    const availableSlots = doctorForm.slotsText
      .split(",")
      .map((slot) => slot.trim())
      .filter(Boolean);

    try {
      setCreatingDoctor(true);
      const created = await createDoctor({
        name: doctorForm.name.trim(),
        department: doctorForm.department.trim(),
        room: doctorForm.room.trim(),
        availableSlots:
          availableSlots.length > 0
            ? availableSlots
            : DEFAULT_SLOTS.split(",").map((s) => s.trim()),
      });
      setDoctors((prev) => [...prev, created]);
      setSelectedDepartment("All");
      setForm((prev) => ({
        ...prev,
        doctorId: created._id,
        timeSlot: created.availableSlots?.[0] || "",
      }));
      setDoctorForm(initialDoctorForm);
      setShowAddDoctor(false);
      setMessage({
        type: "success",
        text: `Added ${created.name} (${created.department} — ${created.room}).`,
      });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setCreatingDoctor(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);

    if (bookedSlots.has(form.timeSlot)) {
      setMessage({
        type: "error",
        text: `${form.timeSlot} is already booked for ${selectedDoctor?.name} on ${form.date}.`,
      });
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...form,
        age: form.age === "" ? undefined : Number(form.age),
        email: form.email.trim() || undefined,
      };
      const created = await createAppointment(payload);
      setAppointments((prev) => [created, ...prev]);
      setMessage({
        type: "success",
        text: `Appointment booked for ${created.patient?.fullName} with ${created.doctor?.name} on ${created.date} at ${created.timeSlot}.`,
      });
      setForm((prev) => ({
        ...prev,
        timeSlot: "",
        fullName: "",
        phone: "",
        email: "",
        age: "",
        reason: "General Consultation",
      }));
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCancel(id) {
    setMessage(null);
    try {
      const updated = await cancelAppointment(id);
      setAppointments((prev) =>
        prev.map((item) => (item._id === id ? updated : item))
      );
      setMessage({
        type: "success",
        text: "Appointment cancelled and time slot released.",
      });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    }
  }

  return (
    <div
      style={{
        maxWidth: 960,
        margin: "2rem auto",
        padding: "0 1rem",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <h1>Hospital Appointment Booking</h1>

      {message && (
        <div
          style={{
            padding: "0.75rem 1rem",
            marginBottom: "1rem",
            borderRadius: 6,
            backgroundColor: message.type === "error" ? "#fee2e2" : "#dcfce7",
            color: message.type === "error" ? "#991b1b" : "#166534",
          }}
        >
          {message.text}
        </div>
      )}

      {/* Add Doctor Collapsible Box */}
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
          <strong>Hospital Doctors ({doctors.length})</strong>
          <button
            type="button"
            onClick={() => setShowAddDoctor((prev) => !prev)}
            style={{ padding: "0.35rem 0.75rem", cursor: "pointer" }}
          >
            {showAddDoctor ? "Close Form" : "+ Add Doctor"}
          </button>
        </div>

        {showAddDoctor && (
          <form
            onSubmit={handleAddDoctorSubmit}
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
                onChange={handleDoctorFormChange}
                placeholder="e.g., Dr. Abel Mekonnen"
                required
                style={{ display: "block", width: "100%", padding: "0.45rem", marginTop: 4 }}
              />
            </label>

            <label>
              Department
              <input
                type="text"
                name="department"
                value={doctorForm.department}
                onChange={handleDoctorFormChange}
                placeholder="e.g., Pediatrics"
                required
                style={{ display: "block", width: "100%", padding: "0.45rem", marginTop: 4 }}
              />
            </label>

            <label>
              Room
              <input
                type="text"
                name="room"
                value={doctorForm.room}
                onChange={handleDoctorFormChange}
                placeholder="e.g., Room 204"
                required
                style={{ display: "block", width: "100%", padding: "0.45rem", marginTop: 4 }}
              />
            </label>

            <label>
              Available Slots (comma-separated)
              <input
                type="text"
                name="slotsText"
                value={doctorForm.slotsText}
                onChange={handleDoctorFormChange}
                style={{ display: "block", width: "100%", padding: "0.45rem", marginTop: 4 }}
              />
            </label>

            <div style={{ gridColumn: "1 / -1" }}>
              <button
                type="submit"
                disabled={creatingDoctor}
                style={{ padding: "0.55rem 1rem", cursor: "pointer" }}
              >
                {creatingDoctor ? "Saving Doctor..." : "Save Doctor"}
              </button>
            </div>
          </form>
        )}
      </div>

      {loading ? (
        <p>Loading doctors and appointments...</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "2rem",
            alignItems: "start",
          }}
        >
          {/* Booking Form */}
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
          >
            <h2>Book an Appointment</h2>

            <label>
              Department
              <select
                value={selectedDepartment}
                onChange={(e) => handleDepartmentChange(e.target.value)}
                style={{ display: "block", width: "100%", padding: "0.5rem", marginTop: 4 }}
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Doctor
              <select
                name="doctorId"
                value={form.doctorId}
                onChange={(e) => handleDoctorChange(e.target.value)}
                required
                style={{ display: "block", width: "100%", padding: "0.5rem", marginTop: 4 }}
              >
                {filteredDoctors.map((doc) => (
                  <option key={doc._id} value={doc._id}>
                    {doc.name} — {doc.department} ({doc.room})
                  </option>
                ))}
              </select>
            </label>

            <label>
              Date
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                required
                style={{ display: "block", width: "100%", padding: "0.5rem", marginTop: 4 }}
              />
            </label>

            <label>
              Time Slot
              <select
                name="timeSlot"
                value={form.timeSlot}
                onChange={handleChange}
                required
                style={{ display: "block", width: "100%", padding: "0.5rem", marginTop: 4 }}
              >
                <option value="">Select a time slot</option>
                {(selectedDoctor?.availableSlots || []).map((slot) => {
                  const isTaken = bookedSlots.has(slot);
                  return (
                    <option key={slot} value={slot} disabled={isTaken}>
                      {slot} {isTaken ? "(Booked)" : ""}
                    </option>
                  );
                })}
              </select>
            </label>

            <label>
              Patient Full Name
              <input
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="e.g., Dawit Kebede"
                required
                style={{ display: "block", width: "100%", padding: "0.5rem", marginTop: 4 }}
              />
            </label>

            <label>
              Phone Number
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="e.g., +251911223344"
                required
                style={{ display: "block", width: "100%", padding: "0.5rem", marginTop: 4 }}
              />
            </label>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <label>
                Age
                <input
                  type="number"
                  name="age"
                  min="0"
                  value={form.age}
                  onChange={handleChange}
                  style={{ display: "block", width: "100%", padding: "0.5rem", marginTop: 4 }}
                />
              </label>

              <label>
                Gender
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  style={{ display: "block", width: "100%", padding: "0.5rem", marginTop: 4 }}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </label>
            </div>

            <label>
              Email (Optional)
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                style={{ display: "block", width: "100%", padding: "0.5rem", marginTop: 4 }}
              />
            </label>

            <label>
              Reason for Visit
              <input
                type="text"
                name="reason"
                value={form.reason}
                onChange={handleChange}
                style={{ display: "block", width: "100%", padding: "0.5rem", marginTop: 4 }}
              />
            </label>

            <button
              type="submit"
              disabled={submitting || filteredDoctors.length === 0}
              style={{ padding: "0.65rem 1rem", cursor: "pointer", marginTop: 4 }}
            >
              {submitting ? "Booking..." : "Confirm Appointment"}
            </button>
          </form>

          {/* Appointments List */}
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "0.75rem",
                marginBottom: "0.75rem",
              }}
            >
              <h2 style={{ margin: 0 }}>
                Appointments ({filteredAppointments.length})
              </h2>

              <label style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <span>Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{ padding: "0.35rem 0.5rem" }}
                >
                  <option value="All">All</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </label>
            </div>

            {filteredAppointments.length === 0 ? (
              <p>
                No {statusFilter === "All" ? "" : statusFilter.toLowerCase()} appointments found.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {filteredAppointments.map((appt) => (
                  <div
                    key={appt._id}
                    style={{
                      border: "1px solid #d1d5db",
                      borderRadius: 6,
                      padding: "0.75rem 1rem",
                    }}
                  >
                    <strong>{appt.patient?.fullName || "Patient"}</strong> ({appt.patient?.phone})
                    <div>
                      {appt.doctor?.name} — {appt.department} ({appt.doctor?.room})
                    </div>
                    <div>
                      <strong>{appt.date}</strong> at <strong>{appt.timeSlot}</strong> • Status:{" "}
                      <span>{appt.status}</span>
                    </div>
                    {appt.reason && (
                      <div style={{ fontSize: "0.9rem" }}>Reason: {appt.reason}</div>
                    )}
                    {appt.status === "Scheduled" && (
                      <button
                        type="button"
                        onClick={() => handleCancel(appt._id)}
                        style={{
                          marginTop: "0.5rem",
                          padding: "0.35rem 0.75rem",
                          cursor: "pointer",
                        }}
                      >
                        Cancel Appointment
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}