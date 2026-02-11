import React, { useState, useEffect, useRef } from "react";
import { useAuthStore } from "../../store/authStore.js";
import { getPOList } from "../../api/poApi";
import Button from "../../components/ui/Button.jsx";

// Status color map
const statusColor = {
  'Submitted': '#2563eb',
  'Manager Pending': '#f59e42',
  'Finance Pending': '#ef4444',
  'Director Pending': '#22c55e',
  'Approved': '#16a34a',
  'Rejected': '#ef4444',
  'Draft': '#64748b',
};

// Simple modal component for demo
function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.2)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: 12, padding: 32, minWidth: 340, position: "relative" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 12, right: 16, background: "none", border: "none", fontSize: 22, cursor: "pointer" }}>×</button>
        {children}
      </div>
    </div>
  );
}

export default function Dashboard() {
  // State declarations
  const [poList, setPoList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const pagedPOs = poList.slice((page - 1) * pageSize, page * pageSize);
  const pageCount = Math.ceil(poList.length / pageSize);
  const [showAddPo, setShowAddPo] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importError, setImportError] = useState("");
  const [importResult, setImportResult] = useState(null);
  const [importing, setImporting] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const dropdownRef = useRef(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const { setAuth, user } = useAuthStore();

  async function handleImport() {
    if (!importFile) return;
    setImporting(true);
    setImportError("");
    setImportResult(null);
    setShowErrorPopup(false);
    try {
      const { importPO } = await import("../../api/poApi");
      const resp = await importPO(importFile);
      setImportResult(resp);
      setImporting(false);
      if (resp.errors && resp.errors.length > 0) {
        setShowErrorPopup(true);
      }
    } catch (e) {
      setImportError(e?.response?.data?.detail || e.message || "Import failed.");
      setImporting(false);
      setShowErrorPopup(true);
    }
  }

  function handleLogout() {
    setAuth({ token: "", user: "", role: "" });
    window.location.href = "/login";
  }

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClick);
    } else {
      document.removeEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [dropdownOpen]);

  // Fetch PO list from backend
  useEffect(() => {
    setLoading(true);
    getPOList()
      .then(res => {
        console.log("PO API:", res);
        // Expecting { data: { items: [...] } }
        setPoList(Array.isArray(res?.data?.items) ? res.data.items : []);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // Demo data for cards, table, status, notifications
  const summary = [
    { label: "Total POs", value: 128, icon: "📄", color: "#2563eb" },
    { label: "Pending Approval", value: 24, icon: "🗂️", color: "#f59e42" },
    { label: "Approved", value: 82, icon: "✅", color: "#22c55e" },
    { label: "Rejected", value: 12, icon: "❌", color: "#ef4444" },
  ];
  const approvalStatus = [
    { label: "Manager Pending", value: 8, color: "#f59e42" },
    { label: "Finance Pending", value: 5, color: "#2563eb" },
    { label: "Urgent POs", value: 3, color: "#ef4444" },
    { label: "Delayed POs", value: 4, color: "#f43f5e" },
  ];
  const notifications = [
    { text: "PO1208 approved by Director", type: "success" },
    { text: "Reminder: PO1231 pending for review", type: "info" },
    { text: "PO1129 was rejected", type: "error" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f4f6fa" }}>
      {/* Top Bar */}
      <header style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 32px",
        background: "#2563eb",
        color: "#fff",
        position: "sticky",
        top: 0,
        zIndex: 10
      }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <img src="/logo.png" alt="App Logo" style={{ width: 36, height: 36, marginRight: 12 }} />
          <span style={{ fontSize: 22, fontWeight: 700 }}>PO Management</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <input type="text" placeholder="Search" style={{ padding: 6, borderRadius: 6, border: "none", outline: "none", width: 180 }} />
          <span style={{ fontSize: 22, cursor: "pointer" }} title="Mail">✉️</span>
          <span style={{ fontSize: 22, cursor: "pointer", position: "relative" }} title="Notifications">
            🔔
            <span style={{ position: "absolute", top: -6, right: -8, background: "#ef4444", color: "#fff", borderRadius: "50%", fontSize: 12, padding: "2px 6px" }}>3</span>
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <img src="/avatar.png" alt="User" style={{ width: 32, height: 32, borderRadius: "50%" }} />
            <span>{user && typeof user === "object" ? (user.full_name || user.username || "User") : (user || "User")}</span>
            <div style={{ position: "relative" }} ref={dropdownRef}>
              <span
                style={{ fontSize: 16, cursor: "pointer", color: "#fff" }}
                onClick={() => setDropdownOpen((v) => !v)}
              >
                ▼
              </span>
              {dropdownOpen && (
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: 28,
                    background: "#fff",
                    color: "#222",
                    boxShadow: "0 2px 8px #e0e7ef",
                    borderRadius: 8,
                    padding: 12,
                    minWidth: 120,
                    zIndex: 100
                  }}
                >
                  <Button onClick={handleLogout} style={{ width: "100%", marginTop: 8 }}>Logout</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Summary Cards */}
      <div style={{ display: "flex", gap: 24, margin: "32px 0 16px 0", justifyContent: "flex-start" }}>
        {summary.map((card, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px #e0e7ef", padding: 24, minWidth: 180, flex: 1 }}>
            <div style={{ fontSize: 32 }}>{card.icon}</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: card.color }}>{card.value}</div>
            <div style={{ fontSize: 16, color: "#64748b", marginTop: 8 }}>{card.label}</div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
        {/* Left: Filters + Table */}
        <div style={{ flex: 3 }}>
          {/* Advanced Filters */}
          <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px #e0e7ef", padding: 20, marginBottom: 18 }}>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
              <select style={{ padding: 6, borderRadius: 6, border: "1px solid #e5e7eb" }}><option>PO Number</option></select>
              <select style={{ padding: 6, borderRadius: 6, border: "1px solid #e5e7eb" }}><option>Vendor</option></select>
              <select style={{ padding: 6, borderRadius: 6, border: "1px solid #e5e7eb" }}><option>Status</option></select>
              <input type="date" style={{ padding: 6, borderRadius: 6, border: "1px solid #e5e7eb" }} />
              <input type="date" style={{ padding: 6, borderRadius: 6, border: "1px solid #e5e7eb" }} />
              <select style={{ padding: 6, borderRadius: 6, border: "1px solid #e5e7eb" }}><option>Amount</option></select>
              <button style={{ padding: "6px 18px", borderRadius: 6, background: "#e5e7eb", border: "none", color: "#222" }}>Reset</button>
              <button style={{ padding: "6px 18px", borderRadius: 6, background: "#2563eb", border: "none", color: "#fff" }}>Search</button>
            </div>
          </div>

          {/* Table: My Purchase Orders + Add/Import */}
          <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px #e0e7ef", padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontWeight: 700, fontSize: 18 }}>My Purchase Orders</div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setShowAddPo(true)} style={{ background: "#2563eb", color: "#fff", border: "none", borderRadius: 6, padding: "6px 16px", fontWeight: 600, fontSize: 15, cursor: "pointer" }}>+ Add PO</button>
                <button onClick={() => setShowImport(true)} style={{ background: "#22c55e", color: "#fff", border: "none", borderRadius: 6, padding: "6px 16px", fontWeight: 600, fontSize: 15, cursor: "pointer" }}>Import from Excel</button>
              </div>
            </div>
            <div style={{ display: "flex", gap: 16, fontSize: 13, marginBottom: 8 }}>
              <span style={{ color: "#2563eb" }}>Created</span>
              <span style={{ color: "#f59e42" }}>Manager</span>
              <span style={{ color: "#ef4444" }}>Finance</span>
              <span style={{ color: "#22c55e" }}>Director</span>
              <span style={{ color: "#16a34a" }}>Approved</span>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f4f6fa", color: "#64748b" }}>
                  <th style={{ textAlign: "left", padding: "10px 12px", fontWeight: 600, fontSize: 15 }}>PO Number</th>
                  <th style={{ textAlign: "left", padding: "10px 12px", fontWeight: 600, fontSize: 15 }}>PO Date</th>
                  <th style={{ textAlign: "left", padding: "10px 12px", fontWeight: 600, fontSize: 15 }}>Vendor</th>
                  <th style={{ textAlign: "left", padding: "10px 12px", fontWeight: 600, fontSize: 15 }}>Vendor Email</th>
                  <th style={{ textAlign: "left", padding: "10px 12px", fontWeight: 600, fontSize: 15 }}>Vendor Phone</th>
                  <th style={{ textAlign: "left", padding: "10px 12px", fontWeight: 600, fontSize: 15 }}>Department</th>
                  <th style={{ textAlign: "left", padding: "10px 12px", fontWeight: 600, fontSize: 15 }}>Project</th>
                  <th style={{ textAlign: "left", padding: "10px 12px", fontWeight: 600, fontSize: 15 }}>Priority</th>
                  <th style={{ textAlign: "center", padding: "10px 12px", fontWeight: 600, fontSize: 15 }}>Status</th>
                  <th style={{ textAlign: "left", padding: "10px 12px", fontWeight: 600, fontSize: 15 }}>Remarks</th>
                  <th style={{ textAlign: "right", padding: "10px 12px", fontWeight: 600, fontSize: 15 }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="11">Loading...</td></tr>
                ) : poList.length === 0 ? (
                  <tr><td colSpan="11" style={{ color: 'red' }}>No purchase orders found.<br />Check console for API errors.</td></tr>
                ) : (
                  pagedPOs.map((po, idx) => (
                    <tr key={po.id || po.po_number || idx}>
                      <td style={{ textAlign: "left", padding: "10px 12px", fontSize: 14 }}>{po.po_number}</td>
                      <td style={{ textAlign: "left", padding: "10px 12px", fontSize: 14 }}>{po.po_date}</td>
                      <td style={{ textAlign: "left", padding: "10px 12px", fontSize: 14 }}>{po.vendor}</td>
                      <td style={{ textAlign: "left", padding: "10px 12px", fontSize: 14 }}>{po.vendor_email}</td>
                      <td style={{ textAlign: "left", padding: "10px 12px", fontSize: 14 }}>{po.vendor_phone}</td>
                      <td style={{ textAlign: "left", padding: "10px 12px", fontSize: 14 }}>{po.department}</td>
                      <td style={{ textAlign: "left", padding: "10px 12px", fontSize: 14 }}>{po.project_name}</td>
                      <td style={{ textAlign: "left", padding: "10px 12px", fontSize: 14 }}>{po.priority}</td>
                      <td style={{ textAlign: "center", padding: "10px 12px", fontSize: 14 }}>
                        <span style={{ color: statusColor[po.status] || '#333', fontWeight: 'bold', padding: '2px 8px', borderRadius: '4px', background: statusColor[po.status] ? statusColor[po.status] + '22' : '#eee' }}>{po.status}</span>
                      </td>
                      <td style={{ textAlign: "left", padding: "10px 12px", fontSize: 14 }}>{po.remarks}</td>
                      <td style={{ textAlign: "right", padding: "10px 12px", fontSize: 14 }}>
                        {typeof po.total_amount === 'number' ? po.total_amount.toLocaleString('en-IN', { style: 'currency', currency: po.currency || 'INR' }) : '₹0'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
              {/* Pagination Controls */}
              {pageCount > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16, gap: 8 }}>
                  <button onClick={() => setPage(page - 1)} disabled={page === 1} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #e5e7eb', background: page === 1 ? '#e5e7eb' : '#fff', color: '#222', cursor: page === 1 ? 'not-allowed' : 'pointer' }}>Prev</button>
                  {Array.from({ length: pageCount }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #2563eb', background: page === i + 1 ? '#2563eb' : '#fff', color: page === i + 1 ? '#fff' : '#2563eb', fontWeight: page === i + 1 ? 700 : 400, cursor: 'pointer' }}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button onClick={() => setPage(page + 1)} disabled={page === pageCount} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #e5e7eb', background: page === pageCount ? '#e5e7eb' : '#fff', color: '#222', cursor: page === pageCount ? 'not-allowed' : 'pointer' }}>Next</button>
                </div>
              )}
            {/* Add PO Modal */}
            <Modal open={showAddPo} onClose={() => setShowAddPo(false)}>
              <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 16 }}>Add Purchase Order</div>
              <form style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <input placeholder="PO Number" style={{ padding: 8, borderRadius: 6, border: "1px solid #e5e7eb" }} />
                <input placeholder="Vendor" style={{ padding: 8, borderRadius: 6, border: "1px solid #e5e7eb" }} />
                <input placeholder="Amount" type="number" style={{ padding: 8, borderRadius: 6, border: "1px solid #e5e7eb" }} />
                <select style={{ padding: 8, borderRadius: 6, border: "1px solid #e5e7eb" }}>
                  <option>Status</option>
                  <option>Manager Review</option>
                  <option>Finance Review</option>
                  <option>Director Approval</option>
                  <option>Approved</option>
                  <option>Rejected</option>
                </select>
                <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                  <button type="button" style={{ background: "#2563eb", color: "#fff", border: "none", borderRadius: 6, padding: "8px 18px", fontWeight: 600, fontSize: 15, cursor: "pointer" }}>Add</button>
                  <button type="button" onClick={() => setShowAddPo(false)} style={{ background: "#e5e7eb", color: "#222", border: "none", borderRadius: 6, padding: "8px 18px", fontWeight: 600, fontSize: 15, cursor: "pointer" }}>Cancel</button>
                </div>
              </form>
            </Modal>
            {/* Import Modal */}
            <Modal open={showImport} onClose={() => { setShowImport(false); setImportFile(null); setImportError(""); setImportResult(null); setImporting(false); setShowErrorPopup(false); }}>
              {importing && (
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
                  <svg width="48" height="48" viewBox="0 0 48 48">
                    <circle cx="24" cy="24" r="20" fill="none" stroke="#e5e7eb" strokeWidth="6" />
                    <circle cx="24" cy="24" r="20" fill="none" stroke="#2563eb" strokeWidth="6" strokeDasharray="125" strokeDashoffset="60" style={{ transition: "stroke-dashoffset 0.5s", animation: "spin 1s linear infinite" }} />
                    <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
                  </svg>
                </div>
              )}
              {/* Error Popup */}
              {showErrorPopup && (
                <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.2)", zIndex: 3000, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ background: "#fff", borderRadius: 12, padding: 32, minWidth: 340, minHeight: 120, position: "relative", boxShadow: "0 2px 12px #e0e7ef" }}>
                    <button onClick={() => setShowErrorPopup(false)} style={{ position: "absolute", top: 12, right: 16, background: "none", border: "none", fontSize: 22, cursor: "pointer" }}>×</button>
                    <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 16, color: "#ef4444" }}>Import Error</div>
                    {importError && <div style={{ color: "#ef4444", marginBottom: 8 }}>{importError}</div>}
                    {importResult && importResult.errors && importResult.errors.length > 0 && (
                      <ul style={{ color: "#ef4444", fontSize: 13 }}>
                        {importResult.errors.map((err, idx) => (
                          <li key={idx}>Row {err.row}: {err.error}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}
              <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 16 }}>Import POs from Excel/CSV</div>
              <input
                type="file"
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                style={{ marginBottom: 16 }}
                onChange={e => setImportFile(e.target.files[0] || null)}
              />
              <div style={{ color: "#64748b", fontSize: 14, marginBottom: 12 }}>Upload a .csv or .xlsx file to bulk add purchase orders.</div>
              {importError && <div style={{ color: "#ef4444", marginBottom: 8 }}>{importError}</div>}
              {importResult && importResult.imported && (
                <div style={{ color: "#22c55e", marginBottom: 8 }}>
                  Imported: {importResult.imported.join(", ")}
                </div>
              )}
              {importResult && importResult.errors && importResult.errors.length > 0 && (
                <div style={{ color: "#ef4444", marginBottom: 8 }}>
                  Errors:<br />
                  <ul style={{ color: "#ef4444", fontSize: 13 }}>
                    {importResult.errors.map((err, idx) => (
                      <li key={idx}>Row {err.row}: {err.error}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  style={{ background: "#22c55e", color: "#fff", border: "none", borderRadius: 6, padding: "8px 18px", fontWeight: 600, fontSize: 15, cursor: "pointer" }}
                  onClick={handleImport}
                  disabled={!importFile}
                >
                  Import
                </button>
                <button type="button" onClick={() => { setShowImport(false); setImportFile(null); setImportError(""); setImportResult(null); }} style={{ background: "#e5e7eb", color: "#222", border: "none", borderRadius: 6, padding: "8px 18px", fontWeight: 600, fontSize: 15, cursor: "pointer" }}>Cancel</button>
              </div>
            </Modal>
          </div>
        </div>

        {/* Right: Approval Status + Notifications */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Approval Status */}
          <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px #e0e7ef", padding: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 10 }}>Approval Status</div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {approvalStatus.map((s, i) => (
                <li key={i} style={{ display: "flex", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: s.color, display: "inline-block", marginRight: 10 }}></span>
                  <span style={{ flex: 1 }}>{s.label}</span>
                  <span style={{ fontWeight: 600 }}>{s.value}</span>
                </li>
              ))}
            </ul>
          </div>
          {/* Notifications */}
          <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px #e0e7ef", padding: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Notifications</span>
              <a href="#" style={{ color: "#2563eb", fontSize: 13 }}>View All</a>
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {notifications.map((n, i) => (
                <li key={i} style={{ display: "flex", alignItems: "center", marginBottom: 8, color: n.type === "error" ? "#ef4444" : n.type === "success" ? "#22c55e" : "#2563eb" }}>
                  <span style={{ marginRight: 8 }}>{n.type === "error" ? "⛔" : n.type === "success" ? "✅" : "🔔"}</span>
                  <span>{n.text}</span>
                </li>
              ))}
            </ul>
          </div>
          <button style={{ marginTop: 8, background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, padding: "10px 0", fontWeight: 600, fontSize: 16, cursor: "pointer" }}>
            <span style={{ marginRight: 8 }}>🔔</span>Send Reminder
          </button>
        </div>
      </div>
    </div>
  );
}
