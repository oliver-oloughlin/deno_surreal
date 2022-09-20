import { ConnectionOptions, Record, JSONObject, DataObject, PartialDataObject, QueryResult } from "./types.ts"

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

  async query<T extends JSONObject>(queryStr: string) {
    try {
      const res = await fetch(this.sqlUrl, {
        method: "POST",
        headers: this.headers,
        body: queryStr
      })
  
      const queryResults = await res.json() as QueryResult<T>[]
      const firstQR = queryResults[0]
  
      if (!res.ok || !firstQR) {
        if (queryResults) console.error(queryResults)
        return [] as QueryResult<T>[]
      }
  
      return queryResults
    } catch (err) {
      console.error(err)
      return [] as QueryResult<T>[]
    }
  }

  async singleQuery<T extends JSONObject>(queryStr: string) {
    try {
      const res = await fetch(this.sqlUrl, {
        method: "POST",
        headers: this.headers,
        body: queryStr
      })
  
      const queryResults = await res.json() as QueryResult<T>[]
      const firstQR = queryResults[0]
      const result = firstQR?.result
  
      if (!res.ok || !firstQR || !result) {
        if (queryResults) console.error(queryResults)
        return [] as T[]
      }
  
      return result
    } catch (err) {
      console.error(err)
      return [] as T[]
    }
  }

  async create<T extends JSONObject>(identifier: string, data: DataObject<T>) {
    try {
      const url = this.#getIdentifierUrl(identifier)
      const res = await fetch(url, {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify(data)
      })

      const queryResults = await res.json() as QueryResult<Record<T>>[]
      const firstQR = queryResults[0]
      const result = firstQR?.result

      if (!res.ok || firstQR.status === "ERR" || !result) {
        if (firstQR) console.error(firstQR)
        return null
      }

      const [ created ] = result
      return created
    } catch (err) {
      console.error(err)
      return null
    }
  }

  async select<T extends JSONObject>(identifier: string) {
    try {
      const url = this.#getIdentifierUrl(identifier)
      const res = await fetch(url, {
        method: "GET",
        headers: this.headers
      })

      const queryResults = await res.json() as QueryResult<Record<T>>[]
      const firstQR = queryResults[0]
      const result = firstQR?.result

      if (!res.ok || !result || firstQR.status === "ERR") {
        if (firstQR) console.error(firstQR)
        return [] as Record<T>[]
      }

      return firstQR.result!
    } catch (err) {
      console.error(err)
      return [] as Record<T>[]
    }
  }

  async delete(identifier: string) {
    try {
      const url = this.#getIdentifierUrl(identifier)
      const res = await fetch(url, {
        method: "DELETE",
        headers: this.headers
      })

      const queryResults = await res.json()
      const firstQR = queryResults[0]

      if (!res.ok || !firstQR || firstQR.status === "ERR") {
        if (firstQR) console.error(firstQR)
        else console.error(queryResults)
      }
    } catch (err) {
      console.error(err)
    }
  }

  async update<T extends JSONObject>(identifier: string, data: PartialDataObject<T>) {
    try {
      const url = this.#getIdentifierUrl(identifier)
      const res = await fetch(url, {
        method: "PUT",
        headers: this.headers,
        body: JSON.stringify(data)
      })

      const queryResults = await res.json() as QueryResult<Record<T>>[]
      const firstQR = queryResults[0]
      const result = firstQR?.result

      if (!res.ok || !result || firstQR.status === "ERR") {
        if (firstQR) console.error(firstQR)
        return null
      }

      const [ updated ] = result
      return updated
    } catch (err) {
      console.error(err)
      return null
    }
  }

  async modify<T extends JSONObject>(identifier: string, data: PartialDataObject<T>) {
    try {
      const url = this.#getIdentifierUrl(identifier)
      const res = await fetch(url, {
        method: "PATCH",
        headers: this.headers,
        body: JSON.stringify(data)
      })

      const queryResults = await res.json() as QueryResult<Record<T>>[]
      const firstQR = queryResults[0]
      const result = firstQR?.result

      if (!res.ok || !result || firstQR.status === "ERR") {
        if (firstQR) console.error(firstQR)
        return null
      }

      const [ modified ] = result
      return modified
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