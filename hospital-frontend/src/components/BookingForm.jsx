export default function BookingForm({
  departments,
  selectedDepartment,
  onDepartmentChange,
  filteredDoctors,
  selectedDoctor,
  bookedSlots,
  form,
  onDoctorChange,
  onChange,
  onSubmit,
  submitting,
}) {
  return (
    <form
      onSubmit={onSubmit}
      style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
    >
      <h2>Book an Appointment</h2>

      <label>
        Department
        <select
          value={selectedDepartment}
          onChange={(e) => onDepartmentChange(e.target.value)}
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
          onChange={(e) => onDoctorChange(e.target.value)}
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
          onChange={onChange}
          required
          style={{ display: "block", width: "100%", padding: "0.5rem", marginTop: 4 }}
        />
      </label>

      <label>
        Time Slot
        <select
          name="timeSlot"
          value={form.timeSlot}
          onChange={onChange}
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
          onChange={onChange}
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
          onChange={onChange}
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
            onChange={onChange}
            style={{ display: "block", width: "100%", padding: "0.5rem", marginTop: 4 }}
          />
        </label>

        <label>
          Gender
          <select
            name="gender"
            value={form.gender}
            onChange={onChange}
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
          onChange={onChange}
          style={{ display: "block", width: "100%", padding: "0.5rem", marginTop: 4 }}
        />
      </label>

      <label>
        Reason for Visit
        <input
          type="text"
          name="reason"
          value={form.reason}
          onChange={onChange}
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
  );
}