import { SurrealDB } from "./db.ts"
import { JSONObject, CompareOperator, Order, PrimitiveValue, DataObject, PartialDataObject, Setters, Record } from "./types.ts"
import { settersToString } from "./utils.ts"

export class QueryBuilder<T extends JSONObject> {

  private db: SurrealDB

  constructor(db: SurrealDB) {
    this.db = db
  }

  select(...fields: string[]) {
    const select = `SELECT ${fields.join(", ")}`
    return new SelectQueryBuilderStart<T>(this.db, select)
  }

  update(identifier: string, data: DataObject<T>) {
    const update = `UPDATE ${identifier} CONTENT ${JSON.stringify(data)}`
    return new UpdateQueryBuilder<T>(this.db, update)
  }

  modify(identifier: string, data: PartialDataObject<T>) {
    const update = `UPDATE ${identifier} MERGE ${JSON.stringify(data)}`
    return new UpdateQueryBuilder<T>(this.db, update)
  }

  set(identifier: string, setters: Setters<T>) {
    const settersStr = settersToString(setters)
    const update = `UPDATE ${identifier} SET ${settersStr}`
    return new UpdateQueryBuilder<T>(this.db, update)
  }

}

class SelectQueryBuilderStart<T extends JSONObject> {

  private select: string
  private db: SurrealDB

  constructor(db: SurrealDB, select: string) {
    this.db = db
    this.select = select
  }

  from(...identifiers: string[]) {
    const from = ` FROM ${identifiers.join(", ")}`
    return new SelectQueryBuilder(this.db, this.select, from)
  }

}

class SelectQueryBuilder<T extends JSONObject> {

  #where: string
  #groupBy: string
  #orderBy: string
  #limit: string
  private select: string
  private from: string
  private db: SurrealDB

  constructor(db: SurrealDB, select: string, from: string) {
    this.db = db
    this.select = select
    this.from = from
    this.#where = ""
    this.#groupBy = ""
    this.#orderBy = ""
    this.#limit = ""
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
    const queryStr = `${this.select}${this.from}${this.#where}${this.#groupBy}${this.#orderBy}${this.#limit}`
    return await this.db.query<T>(queryStr)
  }

}

class UpdateQueryBuilder<T extends JSONObject> {

  #where: string
  private update: string
  private db: SurrealDB

  constructor(db: SurrealDB, update: string) {
    this.#where = ""
    this.update = update
    this.db = db
  }

  where(field: string, op: CompareOperator, value: PrimitiveValue) {
    if (this.#where) this.#where += ` AND ${field} ${op} ${typeof value === "string" ? `'${value}'` : value}`
    else this.#where = ` WHERE ${field} ${op} ${typeof value === "string" ? `'${value}'` : value}`
    return this
  }

  async execute() {
    const queryStr = `${this.update}${this.#where}`
    return await this.db.query<Record<T>>(queryStr)
  }

}