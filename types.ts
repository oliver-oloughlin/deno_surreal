// Database types
export interface QueryResult<T> {
  time: string,
  status: "OK" | "ERR",
  detail?: string,
  result?: T[]
}

export interface ConnectionOptions {
  host: string,
  user: string,
  pass: string,
  namespace: string,
  database: string
}

// Operators
export type Operator = ">" | "<" | "==" | "<=" | ">="

export type Order = "asc" | "desc"

// Data types
export type Record<T> = T & { id: string }

export type PartialDataObject<T> = Omit<Partial<T>, "id">

export type DataObject<T> = Omit<T, "id">

// JSON and basic types
export interface JSONObject {
  [key: string]: JSONValue
}

export type JSONArray = JSONValue[]

export type JSONValue = PrimitiveValue | JSONObject | JSONArray

export type PrimitiveValue = string | number | boolean