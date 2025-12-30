export interface Action<T = any> {
  action: string;
  row?: T;
}
