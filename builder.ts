import { SurrealDB } from "./db.ts"
import { JSONObject, Operator, Order, PrimitiveValue } from "./types.ts"

export class QueryBuilder<T extends JSONObject> {

  #where: string
  #select: string[]
  #from: string
  #groupBy: string
  #orderBy: string
  #limit: number

  private db: SurrealDB

  constructor(db: SurrealDB) {
    this.db = db
    this.#where = ""
    this.#select = []
    this.#from = ""
    this.#groupBy = ""
    this.#orderBy = ""
    this.#limit = 0
  }

  select(...fields: string[]) {
    this.#select = fields
    return this
  }

  from(identifier: string) {
    this.#from = identifier
    return this
  }

  where(field: string, op: Operator, value: PrimitiveValue) {
    this.#where = `${field} ${op} ${typeof value === "string" ? `'${value}'` : value}`
    return this
  }

  orderBy(field: string, order: Order = "asc") {
    this.#orderBy = `${field} ${order}`
    return this
  }

  async execute() {
    if (!this.#select || !this.#from) throw Error("Incomplete Query")

    const select = `SELECT ${this.#select.join(", ")}`
    const from = `FROM ${this.#from}`
    const where = this.#where ? `WHERE ${this.#where}` : ""

    const queryStr = `${select} ${from} ${where}`

    return await this.db.query<T>(queryStr)
  }

}
