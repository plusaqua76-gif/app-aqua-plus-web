import { Role } from "../guards/guard-role/has-role-guard";

export interface NavItem {
  routeLink: string;
  icon: string;
  label: string;
  allowedRoles: Role[];
}
