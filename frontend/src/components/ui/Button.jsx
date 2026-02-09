export default function Button({ children, loading, ...props }) {
  return (
    <button
      {...props}
      style={{
        width: "100%",
        padding: "12px 14px",
        borderRadius: 8,
        border: "none",
        background: props.disabled ? "#94a3b8" : "#2563eb",
        color: "white",
        fontWeight: 600,
        cursor: props.disabled ? "not-allowed" : "pointer"
      }}
    >
      {loading ? "Loading..." : children}
    </button>
  );
}
