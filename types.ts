export interface QueryResult<T> {
  time: string,
  status: "OK" | "ERR",
  detail?: string,
  result?: T[]
}

export interface ConnectionOptions {
  user: string,
  pass: string,
  namespace: string,
  database: string
}

export type Record<T> = T & { id: string }

export type PartialDataObject<T> = Omit<Partial<T>, "id">

export type DataObject<T> = Omit<T, "id">

export interface JSONObject {
  [key: string]: JSONValue
}

export type JSONArray = Array<JSONValue>

export type JSONValue = string | number | boolean | JSONObject | JSONArray