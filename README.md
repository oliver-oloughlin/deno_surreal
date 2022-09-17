# deno_surreal

**This is a simple module for querying a SurrealDB instance**

Create a SurrealDB connection:

```
import { SurrealDB } from "https://{pathToModule}/mod.ts"

const db = new SurrealDB("http://127.0.0.1:8000/sql", {
  user: "root",
  pass: "root",
  namespace: "test",
  database: "test"
})
```

Create a new table entry:

```
interface Person {
  name: string,
  age: number
}

const p1 = await db.create<Person>("person:1", {
  name: "Max Manus",
  age: 32
})

console.log(p1) // Prints: { age: 23, id: "person:1", name: "Max Manus" }
```

Execute a custom query:

```
interface Person {
  name: string,
  age: number
}

const queryResult = await db.query<Person>("SELECT * FROM person")
const firstQR = queryResult[0]
const result = firstQR.result
console.log(p1)
// Prints: [ { age: 23, id: "person:1", name: "Max Manus" } ]
```

It is also possible to check for errors with the query from the last example:

```
const queryResult = await db.query<Person>("SELECT * FROM person")
const firstQR = queryResult[0]
if (firstQR.status === "ERR") {
  // Do something...
}
```