const ONBOARDING_KEY = "my_book_writer_onboarding_completed";

export function hasCompletedOnboarding(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(ONBOARDING_KEY) === "true";
}

export function setCompletedOnboarding(completed: boolean = true): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ONBOARDING_KEY, completed ? "true" : "false");
}
