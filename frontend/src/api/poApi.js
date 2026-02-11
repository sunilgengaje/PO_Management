import http from "./http";

// Import POs from CSV/XLSX file
export async function importPO(file) {
  const formData = new FormData();
  formData.append("file", file, file.name);
  try {
    const response = await http.post("/po/import", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return response.data ? response.data : response;
  } catch (e) {
    // If backend returns non-JSON (e.g. error), surface raw text
    if (e.response && e.response.data) {
      throw new Error(typeof e.response.data === "string" ? e.response.data : (e.response.data.detail || "Import failed"));
    }
    throw e;
  }
}

// Get all POs
export async function getPOList() {
  return http.get("/po/list");
}
