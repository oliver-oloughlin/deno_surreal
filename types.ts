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

// Query types
export type CompareOperator = ">" | "<" | "==" | "<=" | ">="

export type SetOperator = "=" | "+=" | "-="

export type Order = "asc" | "desc"

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