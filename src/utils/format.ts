export function getInitials(name?: string): string {
  if (!name || !name.trim()) return "AU";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function getTimeGreeting(date: Date = new Date()): string {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return "Bom dia";
  if (hour >= 12 && hour < 18) return "Boa tarde";
  return "Boa noite";
}

export function formatLastEdited(dateStr?: string): string {
  if (!dateStr) return "recentemente";
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "recentemente";

    const now = new Date();
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    const timeStr = date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    if (isToday) {
      return `hoje, às ${timeStr}`;
    }

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday =
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear();

    if (isYesterday) {
      return `ontem, às ${timeStr}`;
    }

    const dateFormatted = date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    return `em ${dateFormatted}, às ${timeStr}`;
  } catch {
    return "recentemente";
  }
}
