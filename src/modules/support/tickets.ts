import { z } from "zod";

export const ticketStatusSchema = z.enum([
  "open",
  "in_progress",
  "waiting",
  "resolved",
  "closed",
]);
export const ticketPrioritySchema = z.enum(["low", "normal", "high", "urgent"]);

const transitions: Record<
  z.infer<typeof ticketStatusSchema>,
  readonly z.infer<typeof ticketStatusSchema>[]
> = {
  open: ["in_progress", "closed"],
  in_progress: ["waiting", "resolved", "closed"],
  waiting: ["in_progress", "resolved", "closed"],
  resolved: ["in_progress", "closed"],
  closed: [],
};

export function changeTicketStatus(current: unknown, next: unknown) {
  const from = ticketStatusSchema.parse(current);
  const to = ticketStatusSchema.parse(next);
  if (!transitions[from].includes(to))
    throw new Error(`Ungültiger Ticketstatus: ${from} → ${to}`);
  return { from, to };
}
