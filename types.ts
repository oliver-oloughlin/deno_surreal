export type QueryResult<T> = ResultEntry<T>[]

export interface ResultEntry<T> {
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

export interface JSONObject {
  [key: string]: JSONValue
}

export type JSONArray = Array<JSONValue>

export type JSONValue = string | number | boolean | JSONObject | JSONArray