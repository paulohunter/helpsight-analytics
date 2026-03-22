import { MetricsResponse } from "../types";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api` || "http://localhost:8000/api";

export async function uploadCsvFile(file: File, startDate?: string, endDate?: string): Promise<MetricsResponse> {
  const formData = new FormData();
  formData.append("file", file);
  if (startDate) formData.append("start_date", startDate);
  if (endDate) formData.append("end_date", endDate);

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail || "Failed to upload file");
  }

  return response.json();
}
