import { SurrealDB } from "./db.ts"
import { JSONObject, CompareOperator, Order, PrimitiveValue, QueryType, DataObject, PartialDataObject, Setters } from "./types.ts"
import { IncompleteQueryError, settersToString } from "./utils.ts"

export class QueryBuilder<T extends JSONObject> {

  #select: string | null
  #update: string | null
  #modify: string | null
  #set: string | null
  #from: string | null
  #where: string
  #groupBy: string
  #orderBy: string
  #limit: string
  private queryType: QueryType | null
  private db: SurrealDB

  constructor(db: SurrealDB) {
    this.db = db
    this.#select = null
    this.#update = null
    this.#modify = null
    this.#set = null
    this.#from = null
    this.#where = ""
    this.#groupBy = ""
    this.#orderBy = ""
    this.#limit = ""
    this.queryType = null
  }

  select(...fields: string[]) {
    this.#select = `SELECT ${fields.join(", ")}`
    this.queryType = "select"
    return this
  }

  from(...identifiers: string[]) {
    this.#from = ` FROM ${identifiers.join(", ")}`
    return this
  }

  update(identifier: string, data: DataObject<T>) {
    this.#update = `UPDATE ${identifier} CONTENT ${JSON.stringify(data)}`
    this.queryType = "update"
    return this
  }

  modify(identifier: string, data: PartialDataObject<T>) {
    this.#modify = `UPDATE ${identifier} PATCH ${JSON.stringify(data)}`
    this.queryType = "update"
    return this
  }

  set(identifier: string, setters: Setters<T>) {
    const settersStr = settersToString(setters)
    this.#set = `UPDATE ${identifier} SET ${settersStr}`
    this.queryType = "set"
    return this
  }

  where(field: string, op: CompareOperator, value: PrimitiveValue) {
    if (this.#where) this.#where += ` AND ${field} ${op} ${typeof value === "string" ? `'${value}'` : value}`
    else this.#where = ` WHERE ${field} ${op} ${typeof value === "string" ? `'${value}'` : value}`
    return this
  }

  groupBy(...fields: string[]) {
    this.#groupBy = ` GROUP BY ${fields.join(", ")}`
    return this
  }

  orderBy(field: string, order: Order = "asc") {
    this.#orderBy = ` ORDER BY ${field} ${order}`
    return this
  }

  limit(num: number) {
    this.#limit = num > 0 ? ` LIMIT ${num}` : ""
    return this
  }

  async execute() {
    switch (this.queryType) {
      case "select": {
        if (!this.#from) return IncompleteQueryError
        const queryStr = `${this.#select}${this.#from}${this.#where}${this.#groupBy}${this.#orderBy}${this.#limit}`
        return await this.db.query<T>(queryStr)
      }

      case "update": {
        const queryStr = `${this.#update}${this.#where}`
        return await this.db.query<T>(queryStr)
      }

      case "modify": {
        const queryStr = `${this.#modify}${this.#where}`
        return await this.db.query<T>(queryStr)
      }

      case "set": {
        const queryStr = `${this.#set}${this.#where}`
        return await this.db.query<T>(queryStr)
      }

      default: throw IncompleteQueryError
    }
  }

}
