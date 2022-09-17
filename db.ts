import { ConnectionOptions, QueryResult } from "./types.ts"

export class SurrealDB {

  private url: string
  private user: string
  private pass: string
  private namespace: string
  private database: string

  constructor(url: string = "http://127.0.0.1:8000/sql", {
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
    const auth = `Basic ${btoa(`${this.user}:${this.pass}`)}`

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