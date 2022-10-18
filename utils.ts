import { QueryResult } from "./types.ts"

export function parseSurrealResponse<T>(json: any) {
  const isError = !!json.code
  if (isError) throw Error(JSON.stringify(json, null, 2))
  return json as QueryResult<T>[]
}

export function parseQueryResult<T>(queryResult: QueryResult<T>) {
  if (queryResult.status === "ERR") throw Error(JSON.stringify(queryResult, null, 2))
  return queryResult.result ?? []
}