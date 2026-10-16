export interface ApiResponse<T = unknown> {
  done: boolean;
  msg: string;
  data?: T;
  count?: number;
  total?: number;
  rows?: T[];
}