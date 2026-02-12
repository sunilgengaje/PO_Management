
import AppRoutes from "./routes/AppRoutes.jsx";
import Loader from "./components/ui/Loader.jsx";
import { useUiStore } from "./store/uiStore.js";

export default function App() {
  const loading = useUiStore((s) => s.loading);
  return (
    <>
      <AppRoutes />
      {loading && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(255,255,255,0.4)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Loader />
        </div>
      )}
    </>
  );
}
