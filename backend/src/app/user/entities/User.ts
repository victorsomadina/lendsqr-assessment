import { BaseEntity } from "../../../common/entities/BaseEntity";

export interface User extends BaseEntity {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}

