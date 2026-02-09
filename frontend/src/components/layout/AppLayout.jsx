export default function AppLayout({ children }) {
  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <header style={{ padding: "16px 24px", background: "#1e3a8a", color: "white" }}>
        <strong>PO Management</strong>
      </header>
      <main style={{ padding: 24 }}>{children}</main>
    </div>
  );
}
