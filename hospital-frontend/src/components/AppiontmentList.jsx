import { useMemo, useState } from "react";

export default function AppointmentList({ appointments = [], onCancel }) {
  const [statusFilter, setStatusFilter] = useState("All");

  const safeAppointments = Array.isArray(appointments) ? appointments : [];

  const filteredAppointments = useMemo(() => {
    if (statusFilter === "All") return safeAppointments;
    return safeAppointments.filter((appt) => appt.status === statusFilter);
  }, [safeAppointments, statusFilter]);

  return (
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
                  onClick={() => onCancel(appt._id)}
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
  );
}