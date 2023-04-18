import Entity, { ID } from './Entity';
import {ObjectId} from "mongoose";

export default class User extends Entity {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  accessToken?: string;
  blogs?:string[];

  constructor({
    id,
    firstName,
    lastName,
    email,
    phone,
    password,
    accessToken,
      blogs,
  }: {
    id?: ID,
    firstName: string,
    lastName: string,
    email: string,
    phone: string,
    password: string,
    accessToken?: string;
    blogs?:string[];
  }) {
    super({ id });
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.phone = phone;
    this.password = password;
    this.accessToken = accessToken;
    this.blogs=blogs
  }
};
