import { SurrealDB } from "./db.ts"
import { JSONObject, CompareOperator, Order, PrimitiveValue, DataObject, PartialDataObject, Setters, Record, ReturnType } from "./types.ts"
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
    return new ActionQueryBuilder<T>(this.db, update)
  }

  modify(identifier: string, data: PartialDataObject<T>) {
    const modify = `UPDATE ${identifier} MERGE ${JSON.stringify(data)}`
    return new ActionQueryBuilder<T>(this.db, modify)
  }

  set(identifier: string, setters: Setters<T>) {
    const settersStr = settersToString(setters)
    const set = `UPDATE ${identifier} SET ${settersStr}`
    return new ActionQueryBuilder<T>(this.db, set)
  }

  delete(identifier: string) {
    const _delete = `DELETE ${identifier}`
    return new ActionQueryBuilder(this.db, _delete)
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
  #start: string
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
    this.#start = ""
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

  orderBy(field: string, order: Order = "ASC") {
    this.#orderBy = ` ORDER BY ${field} ${order}`
    return this
  }

  limit(limit: number) {
    this.#limit = limit > 0 ? ` LIMIT ${limit}` : ""
    return this
  }

  start(start: number) {
    this.#start = start >= 0 ? ` START ${start}` : ""
    return this
  }

  async execute() {
    const queryStr = `${this.select}${this.from}${this.#where}${this.#groupBy}${this.#orderBy}${this.#limit}${this.#start}`
    return await this.db.query<T>(queryStr)
  }

}

class ActionQueryBuilder<T extends JSONObject> {

  #where: string
  #return: string
  private action: string
  private db: SurrealDB

  constructor(db: SurrealDB, action: string) {
    this.#where = ""
    this.#return = ""
    this.action = action
    this.db = db
  }

  where(field: string, op: CompareOperator, value: PrimitiveValue) {
    if (this.#where) this.#where += ` AND ${field} ${op} ${typeof value === "string" ? `'${value}'` : value}`
    else this.#where = ` WHERE ${field} ${op} ${typeof value === "string" ? `'${value}'` : value}`
    return this
  }

  return(type: ReturnType, ...fields: string[]) {
    let _return = " RETURN "
    if (type === "FIELDS") _return += fields.join(", ")
    else _return += type
    this.#return = _return
    return this
  }

  async execute() {
    const queryStr = `${this.action}${this.#where}${this.#return}`
    return await this.db.query<Record<T>>(queryStr)
  }

}