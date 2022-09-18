import { ConnectionOptions, JSONObject, QueryResult } from "./types.ts"

export class SurrealDB {

  private sqlUrl: string
  private tableUrl: string
  private user: string
  private pass: string
  private namespace: string
  private database: string
  private headers: Headers

  constructor(url: string = "http://127.0.0.1:8000", {
    user,
    pass,
    namespace,
    database
  }: ConnectionOptions) {
    this.sqlUrl = `${url}/sql`
    this.tableUrl = `${url}/key/`

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
    const res = await fetch(this.sqlUrl, {
      method: "POST",
      headers: this.headers,
      body: queryStr
    })

    const queryResult = await res.json()

    if (!res.ok) {
      if (queryResult) console.error(queryResult)
      return [] as QueryResult<T>
    }

    return queryResult as QueryResult<T>
  }

  async create<T = JSONObject>(identifier: string, data: T) {
    const url = this.#getIdentifierUrl(identifier)
    const res = await fetch(url, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify(data)
    })

    const queryResult = await res.json() as QueryResult<T>
    const firstQR = queryResult[0]

    if (!res.ok || firstQR.status === "ERR") {
      if (firstQR) console.error(firstQR)
      return null
    }

    return firstQR.result![0]
  }

  async select<T>(identifier: string) {
    const url = this.#getIdentifierUrl(identifier)
    const res = await fetch(url, {
      method: "GET",
      headers: this.headers
    })

    const queryResult = await res.json() as QueryResult<T>
    const firstQR = queryResult[0]

    if (!res.ok || firstQR.status === "ERR") {
      if (firstQR) console.error(firstQR)
      return [] as T[]
    }

    return firstQR.result!
  }

  async delete(identifier: string) {
    const url = this.#getIdentifierUrl(identifier)
    const res = await fetch(url, {
      method: "DELETE",
      headers: this.headers
    })

    const queryResult = await res.json()
    const firstQR = queryResult[0]

    if (!res.ok || firstQR.status === "ERR") {
      if (firstQR) console.error(firstQR)
      return false
    }

    return true
  }

  async update<T = JSONObject>(identifier: string, data: Partial<T>) {
    const url = this.#getIdentifierUrl(identifier)
    const res = await fetch(url, {
      method: "PUT",
      headers: this.headers,
      body: JSON.stringify(data)
    })

    const queryResult = await res.json() as QueryResult<T>
    const firstQR = queryResult[0]

    if (!res.ok || firstQR.status === "ERR") {
      if (firstQR) console.error(firstQR)
      return null
    }

    return firstQR.result![0]
  }

  async change<T = JSONObject>(identifier: string, data: Partial<T>) {
    const url = this.#getIdentifierUrl(identifier)
    const res = await fetch(url, {
      method: "PATCH",
      headers: this.headers,
      body: JSON.stringify(data)
    })

    const queryResult = await res.json() as QueryResult<T>
    const firstQR = queryResult[0]

    if (!res.ok || firstQR.status === "ERR") {
      if (firstQR) console.error(firstQR)
      return null
    }

    return firstQR.result![0]
  }

  #getIdentifierUrl(identifier: string) {
    const parts = identifier.split(":")
    const table = parts[0]
    const id = parts[1]
    return id ? `${this.tableUrl}${table}/${id}` : `${this.tableUrl}${table}`
  }

}