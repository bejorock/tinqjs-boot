import { Request, Response } from "express";

export interface IHttpParam {
  from: "query" | "path" | "body";
  type: "string" | "number" | "boolean" | "array" | "object" | "blob";
  required?: boolean;
  parser?: (value: any) => any;
}

export interface IHttpParams {
  [key: string]: IHttpParam;
}

export interface IHttpContext {
  headers: any;
  query: any;
  params: any;
  body: any;
  req: Partial<Request> & Partial<{ [key: string]: any }>;
}
