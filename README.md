# deno_surreal

**This is a simple module for querying a SurrealDB instance**

Create a SurrealDB instance:

```
import { SurrealDB } from "https://{pathToModule}/mod.ts"

const db = new SurrealDB("http://127.0.0.1:8000/sql", {
  user: "root",
  pass: "root",
  namespace: "test",
  database: "test"
})

```

Execute a simple query without typing:

```
const queryResults = await db.query("CREATE person:p1 SET name = 'Max Manus', age = 23")
const firstResult = queryResults[0]
const data = firstResult.result?.at(0)
console.log(data)
// Prints: { age: 23, id: "person:p1", name: "Max Manus" }
```

Execute a simple typed query:
```
interface Person {
  name: string,
  age: number
}

const queryResults = await db.query<Person>("SELECT * FROM person:p1")
const firstResult = queryResults[0]
const p1 = firstResult.result?.at(0) // p1: Person
console.log(p1)
// Prints: { age: 23, id: "person:p1", name: "Max Manus" }
```