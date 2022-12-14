import { ConnectionOptions, Model, JSONObject, DataObject, PartialDataObject, Setters } from "./types.ts"
import { parseQueryResult, parseSurrealResponse, settersToString } from "./utils.ts"
import { QueryBuilder } from "./builder.ts"

export class SurrealDB {

  private sqlUrl: string
  private tableUrl: string
  private user: string
  private pass: string
  private namespace: string
  private database: string
  private headers: Headers

  constructor({
    host,
    port,
    user,
    pass,
    namespace,
    database
  }: ConnectionOptions) {
    const [_protocol, _hostname, _port] = host.split(":")
    const hostname = _hostname && _hostname.includes("//") ? _hostname.substring(2, _hostname.length) : _protocol
    const protocol = (hostname === "localhost" || hostname === "127.0.0.1") ? "http" : "https"
    const baseUrl = `${protocol}:${hostname}:${port ?? (_port ? _port : _hostname && !_hostname.includes("//") ? _hostname : null) ?? 8000}`
    this.sqlUrl = `${baseUrl}/sql`
    this.tableUrl = `${baseUrl}/key`

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

  async rawQueries<T extends JSONObject>(queryStr: string) {
    const res = await fetch(this.sqlUrl, {
      method: "POST",
      headers: this.headers,
      body: queryStr
    })

    const json = await res.json()
    return parseSurrealResponse<T>(json)
  }

  async queries<T extends JSONObject>(queryStr: string) {
    const res = await fetch(this.sqlUrl, {
      method: "POST",
      headers: this.headers,
      body: queryStr
    })

    const json = await res.json()
    const results = parseSurrealResponse<T>(json)
    return results.map(parseQueryResult<T>)
  }

  async query<T extends JSONObject>(queryStr: string) {
    const [ query ] = queryStr.split(";")

    const res = await fetch(this.sqlUrl, {
      method: "POST",
      headers: this.headers,
      body: query
    })

    const json = await res.json()
    const [ queryResult ] = parseSurrealResponse<T>(json)
    return parseQueryResult<T>(queryResult)
  }

  async select<T extends Model>(identifier: string) {
    const url = this.#getIdentifierUrl(identifier)
    const res = await fetch(url, {
      method: "GET",
      headers: this.headers
    })

    const json = await res.json()
    const [ queryResult ] = parseSurrealResponse<T>(json)
    return parseQueryResult<T>(queryResult)
  }

  async create<T extends Model>(identifier: string, data: DataObject<T>) {
    const url = this.#getIdentifierUrl(identifier)

    const res = await fetch(url, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify(data)
    })

    const json = await res.json()
    const [ queryResult ] = parseSurrealResponse<T>(json)
    const result = parseQueryResult<T>(queryResult)
    const [ created ] = result
    return created
  }

  async delete(identifier: string) {
    const url = this.#getIdentifierUrl(identifier)
    const res = await fetch(url, {
      method: "DELETE",
      headers: this.headers
    })

    const json = await res.json()
    const [ queryResult ] = parseSurrealResponse(json)
    parseQueryResult(queryResult)
  }

  async update<T extends Model>(identifier: string, data: DataObject<T>) {
    const url = this.#getIdentifierUrl(identifier)
    const res = await fetch(url, {
      method: "PUT",
      headers: this.headers,
      body: JSON.stringify(data)
    })

    const json = await res.json()
    const [ queryResult ] = parseSurrealResponse<T>(json)
    const result = parseQueryResult<T>(queryResult)
    const [ created ] = result
    return created
  }

  async modify<T extends Model>(identifier: string, data: PartialDataObject<T>) {
    const url = this.#getIdentifierUrl(identifier)
    const res = await fetch(url, {
      method: "PATCH",
      headers: this.headers,
      body: JSON.stringify(data)
    })

    const json = await res.json()
    const [ queryResult ] = parseSurrealResponse<T>(json)
    const result = parseQueryResult<T>(queryResult)
    const [ created ] = result
    return created
  }

  async set<T extends Model>(identifier: string, setters: Setters<T>) {
    const settersStr = settersToString(setters)
    const [ updated ] = await this.query<T>(`UPDATE ${identifier} SET ${settersStr}`)
    return updated
  }

  queryBuilder() {
    return new QueryBuilder(this)
  }

  #getIdentifierUrl(identifier: string) {
    const parts = identifier.split(":")
    const table = parts[0]
    const id = parts[1]
    return id ? `${this.tableUrl}/${table}/${id}` : `${this.tableUrl}/${table}`
  }

  #createHeaders() {
    const auth = `Basic ${btoa(`${this.user}:${this.pass}`)}`
    return new Headers({
      "Accept": "application/json",
      "Authorization": auth,
      "NS": this.namespace,
      "DB": this.database
    })
  }

}