export class ApiResponse {
  constructor(success, message, data = null) {
    this.success = Boolean(success);
    this.message = message || "";
    this.data = data ?? null;
  }
}
