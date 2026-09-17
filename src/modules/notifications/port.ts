export type NotificationRequest = {
  idempotencyKey: string;
  tenantId: string;
  template: "contact_inquiry_received";
  entityId: string;
};
export interface NotificationPort {
  enqueue(request: NotificationRequest): Promise<void>;
}
