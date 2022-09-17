export type QueryResult<T> = ResultEntry<T>[]

export type ResultEntry<T> = {
  time: string,
  status: "OK" | "ERR",
  detail?: string,
  result?: T[]
}

export type ConnectionOptions = {
  user: string,
  pass: string,
  namespace: string,
  database: string
}