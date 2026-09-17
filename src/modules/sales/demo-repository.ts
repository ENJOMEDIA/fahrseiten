import "server-only";
import type { SalesLeadRecord, SalesLeadRepository } from "./lead-service";
const state = globalThis as typeof globalThis & {
  demoSalesLeads?: SalesLeadRecord[];
};
export const demoSalesLeads = (state.demoSalesLeads ??= []);
export const demoSalesLeadRepository: SalesLeadRepository = {
  async create(record) {
    demoSalesLeads.push(record);
  },
};
