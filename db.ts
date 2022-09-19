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
    
    this.headers = this.#createHeaders()
  }

  signin({ user, pass }: { user?: string, pass?: string }) {
    if (user) this.user = user
    if (pass) this.pass = pass
    this.headers = this.#createHeaders()
  }

  use({ namespace, database }: { namespace?: string, database?: string }) {
    if (namespace) this.namespace = namespace
    if (database) this.database = database
    this.headers = this.#createHeaders()
  }

  async query<T = JSONObject>(queryStr: string) {
    try {
      const res = await fetch(this.sqlUrl, {
        method: "POST",
        headers: this.headers,
        body: queryStr
      })
  
      const queryResult = await res.json()
      const firstQR = queryResult[0]
  
      if (!res.ok || !firstQR) {
        if (queryResult) console.error(queryResult)
        return [] as QueryResult<T>
      }
  
      return queryResult as QueryResult<T>
    } catch (err) {
      console.error(err)
      return [] as QueryResult<T>
    }
  }

  async create<T = JSONObject>(identifier: string, data: T) {
    try {
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
    } catch (err) {
      console.error(err)
      return null
    }
  }

  async select<T>(identifier: string) {
    try {
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
    } catch (err) {
      console.error(err)
      return [] as T[]
    }
  }

  async delete(identifier: string) {
    try {
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
    } catch (err) {
      console.error(err)
      return false
    }
  }

  async update<T = JSONObject>(identifier: string, data: Partial<T>) {
    try {
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
    } catch (err) {
      console.error(err)
      return null
    }
  }

  async modify<T = JSONObject>(identifier: string, data: Partial<T>) {
    try {
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
    } catch (err) {
      console.error(err)
      return null
    }
  }

  #getIdentifierUrl(identifier: string) {
    const parts = identifier.split(":")
    const table = parts[0]
    const id = parts[1]
    return id ? `${this.tableUrl}${table}/${id}` : `${this.tableUrl}${table}`
  }

  #createHeaders() {
    const auth = `Basic ${btoa(`${this.user}:${this.pass}`)}`
    return new Headers({
      "Content-Type": "application/json",
      "Authorization": auth,
      "NS": this.namespace,
      "DB": this.database
    })
  }

}