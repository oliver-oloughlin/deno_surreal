// Database types
export interface QueryResult<T extends JSONObject> {
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

// Operator types
export type CompareOperator = ">" | "<" | "=" | "==" | "!=" | "<=" | ">=" | "~" | "!~" | "?~" | "*~" | "CONTAINS" | "CONTAINSNOT" | "CONTAINSALL" | "CONTAINSANY" | "CONTAINSNONE" | "INSIDE" | "NOTINSIDE" | "ALLINSIDE" | "ANYINSIDE" | "NONEINSIDE" | "OUTSIDE" | "INTERSECTS"

export type SetOperator = "=" | "+=" | "-="

export type Order = "ASC" | "DESC"

export type ReturnType = "NONE" | "AFTER" | "BEFORE" | "DIFF" | "FIELDS"

export type Setters<T extends Model> = {
  [key in keyof PartialDataObject<T>]: Setter
}

export type Setter = [op: SetOperator, value: JSONValue]

// Surreal data objects
export type DataObject<T extends Model> = Omit<T, "id">

export type PartialDataObject<T extends Model> = Partial<DataObject<T>>

export interface Model extends JSONObject {
  id: string
}

// JSON object types
export interface JSONObject {
  [key: string]: JSONValue
}

export type JSONArray = JSONValue[]

export type JSONValue = PrimitiveValue | JSONObject | JSONArray

export type PrimitiveValue = string | number | boolean