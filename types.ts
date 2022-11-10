// Database types
export interface QueryResult<T> {
  time: string,
  status: "OK" | "ERR",
  detail?: string,
  result?: T[]
}

export interface ConnectionOptions {
  host: string,
  port?: number,
  user: string,
  pass: string,
  namespace: string,
  database: string
}

// Operators
export type CompareOperator = ">" | "<" | "=" | "==" | "!=" | "<=" | ">=" | "~" | "!~" | "?~" | "*~" | "CONTAINS" | "CONTAINSNOT" | "CONTAINSALL" | "CONTAINSANY" | "CONTAINSNONE" | "INSIDE" | "NOTINSIDE" | "ALLINSIDE" | "ANYINSIDE" | "NONEINSIDE" | "OUTSIDE" | "INTERSECTS"

export type SetOperator = "=" | "+=" | "-="

// Query types
export type Order = "ASC" | "DESC"

export type ReturnType = "NONE" | "AFTER" | "BEFORE" | "DIFF" | "FIELDS"

// Data types
export type Record<T extends JSONObject> = T & { id: string }

export type PartialDataObject<T extends JSONObject> = Omit<Partial<T>, "id">

export type DataObject<T extends JSONObject> = Omit<T, "id">

export type Setters<T extends JSONObject> = {
  [key in keyof PartialDataObject<T>]: Setter
}

export type Setter = [op: SetOperator, value: JSONValue]

// JSON and basic types
export interface JSONObject {
  [key: string]: JSONValue
}

export type JSONArray = JSONValue[]

export type JSONValue = PrimitiveValue | JSONObject | JSONArray

export type PrimitiveValue = string | number | boolean