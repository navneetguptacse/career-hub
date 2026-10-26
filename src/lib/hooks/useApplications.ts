import useSWR, { mutate as globalMutate } from "swr";
import { JobApplicationItem } from "@/components/applications/JobCard";
import { ApplicationStatusType } from "@/components/ui/Badge";

interface UseApplicationsOptions {
  status?: string;
  search?: string;
}

const fetcher = async (url: string): Promise<JobApplicationItem[]> => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to fetch applications");
  }
  const data = await res.json();
  return data.applications || [];
};

export function useApplications(options: UseApplicationsOptions = {}) {
  const { status = "ALL", search = "" } = options;

  const params = new URLSearchParams();
  if (status !== "ALL") params.append("status", status);
  if (search.trim()) params.append("search", search.trim());

  const queryString = params.toString();
  const endpoint = `/api/applications${queryString ? `?${queryString}` : ""}`;

  const { data, error, isLoading, mutate } = useSWR<JobApplicationItem[]>(
    endpoint,
    fetcher,
    {
      revalidateOnFocus: true,
      dedupingInterval: 2000,
    }
  );

  const applications = data || [];

  const updateStatus = async (
    id: string,
    newStatus: ApplicationStatusType
  ): Promise<boolean> => {
    // Optimistic UI update
    await mutate(
      applications.map((app) =>
        app.id === id ? { ...app, status: newStatus } : app
      ),
      false
    );

    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      await mutate();
      globalMutate(
        (key: unknown) =>
          typeof key === "string" && key.startsWith("/api/applications")
      );
      return true;
    } catch {
      await mutate();
      return false;
    }
  };

  const deleteApplication = async (id: string): Promise<boolean> => {
    // Optimistic UI update
    await mutate(
      applications.filter((app) => app.id !== id),
      false
    );

    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete application");
      await mutate();
      globalMutate(
        (key: unknown) =>
          typeof key === "string" && key.startsWith("/api/applications")
      );
      return true;
    } catch {
      await mutate();
      return false;
    }
  };

  return {
    applications,
    isLoading,
    error,
    mutate,
    updateStatus,
    deleteApplication,
  };
}

export function refreshAllApplications() {
  return globalMutate(
    (key: unknown) =>
      typeof key === "string" && key.startsWith("/api/applications")
  );
}
