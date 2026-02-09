export default function Input({ label, error, ...props }) {
  return (
    <label style={{ display: "block", marginBottom: 16 }}>
      <span style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>{label}</span>
      <input
        {...props}
        style={{
          width: "100%",
          padding: "12px",
          borderRadius: 8,
          border: `1px solid ${error ? "#ef4444" : "#cbd5f5"}`,
          outline: "none"
        }}
      />
      {error && (
        <span style={{ color: "#ef4444", fontSize: 12, marginTop: 6, display: "block" }}>{error}</span>
      )}
    </label>
  );
}
