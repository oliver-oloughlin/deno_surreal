import { ConnectionOptions, QueryResult } from "./types.ts"

export class SurrealDB {

  url: string
  user: string
  pass: string
  namespace: string
  database: string

  constructor(url: string, {
    user,
    pass,
    namespace,
    database
  }: ConnectionOptions) {
    this.url = url
    this.user = user
    this.pass = pass
    this.namespace = namespace
    this.database = database
  }

  async query<T>(queryStr: string) {
    const auth = `Basic ${window.btoa(`${this.user}:${this.pass}`)}`

    const headers = new Headers({
      "Content-Type": "application/json",
      "Authorization": auth,
      "NS": this.namespace,
      "DB": this.database
    })

    const res = await fetch(this.url, {
      method: "POST",
      headers,
      body: queryStr
    })

    const result = await res.json()

    if (!res.ok) {
      console.error(result)
      return [] as QueryResult<T>
    }

    return result as QueryResult<T>
  }

}