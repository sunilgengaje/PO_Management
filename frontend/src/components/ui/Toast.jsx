export default function Toast({ message, type = "success" }) {
  if (!message) return null;
  return (
    <div
      style={{
        padding: "10px 14px",
        borderRadius: 8,
        background: type === "error" ? "#fee2e2" : "#dcfce7",
        color: type === "error" ? "#991b1b" : "#166534",
        fontWeight: 600,
        marginBottom: 16
      }}
    >
      {message}
    </div>
  );
}
