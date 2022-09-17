import { ConnectionOptions, JSONObject, QueryResult } from "./types.ts"

export class SurrealDB {

  private url: string
  private user: string
  private pass: string
  private namespace: string
  private database: string
  private headers: Headers

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
    
    const auth = `Basic ${btoa(`${this.user}:${this.pass}`)}`
    this.headers = new Headers({
      "Content-Type": "application/json",
      "Authorization": auth,
      "NS": this.namespace,
      "DB": this.database
    })
  }

  async query<T = JSONObject>(queryStr: string) {
    const res = await fetch(this.url, {
      method: "POST",
      headers: this.headers,
      body: queryStr
    })

    const result = await res.json()

    if (!res.ok) {
      console.error(result)
      return [] as QueryResult<T>
    }

    return result as QueryResult<T>
  }

  async create<T = JSONObject>(id: string, data: T) {
    const res = await fetch(this.url, {
      method: "POST",
      headers: this.headers,
      body: `CREATE ${id} CONTENT ${JSON.stringify(data)}`
    })

    const queryResults = await res.json() as QueryResult<T>
    const fQueryResult = queryResults[0]

    if (!res.ok  || fQueryResult.status === "ERR") {
      console.error(fQueryResult)
      return null
    }

    const result = fQueryResult.result![0]
    return result
  }

}