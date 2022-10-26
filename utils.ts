import { JSONObject, QueryResult, Setters } from "./types.ts"

export function parseSurrealResponse<T>(json: any) {
  const isError = !!json.code
  if (isError) throw Error(JSON.stringify(json, null, 2))
  return json as QueryResult<T>[]
}

export function parseQueryResult<T>(queryResult: QueryResult<T>) {
  if (queryResult.status === "ERR") throw Error(JSON.stringify(queryResult, null, 2))
  return queryResult.result ?? []
}

export function settersToString<T extends JSONObject>(setters: Setters<T>) {
  const settersArr = Object.entries(setters).map(([key, [op, value]]) => `${key} ${op} ${JSON.stringify(value)}`)
  return settersArr.join(", ")
}