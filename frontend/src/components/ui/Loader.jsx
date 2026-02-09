export default function Loader() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
      <span className="loader" />
      Processing...
      <style>{`
        .loader {
          width: 14px;
          height: 14px;
          border: 2px solid #bfdbfe;
          border-top: 2px solid #2563eb;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { 0% { transform: rotate(0); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
