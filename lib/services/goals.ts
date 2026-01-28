export interface Goal {
  id: string;
  name: string;
  targetAmount: string;
  currentAmount: string;
  targetDate?: string;
}

export interface CreateGoalData {
  name: string;
  targetAmount: string;
  targetDate?: string;
  accountId?: string;
}

export interface UpdateGoalData extends Partial<CreateGoalData> {
  id: string;
}

export async function getGoals(): Promise<Goal[]> {
  const response = await fetch("/api/goals");
  if (!response.ok) {
    throw new Error("Failed to fetch goals");
  }
  return response.json();
}

export async function createGoal(data: CreateGoalData): Promise<Goal> {
  const response = await fetch("/api/goals", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Failed to create goal");
  }
  return response.json();
}

export async function updateGoal(data: UpdateGoalData): Promise<Goal> {
  const response = await fetch("/api/goals", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Failed to update goal");
  }
  return response.json();
}

export async function deleteGoal(id: string): Promise<{ deletedId: string }> {
  const response = await fetch("/api/goals", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id }),
  });
  if (!response.ok) {
    throw new Error("Failed to delete goal");
  }
  return response.json();
}
