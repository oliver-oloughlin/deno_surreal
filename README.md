# deno_surreal

Simple library for querying a SurrealDB database

This library has no dependencies

**Disclaimer! This project is not meant to be a replacement or contender to any official tools/libraries. It is not stable, and exists merely because I wanted to do a small project involving SurrealDB.**

For documentation on SurrealDB go to the official [SurrealDB Website](https://surrealdb.com)

<br>

Create a SurrealDB connection:
> Make sure it is the base url to your hosted database, and includes the port

```
import { SurrealDB } from "https://{pathToModule}/mod.ts"

const db = new SurrealDB("http://127.0.0.1:8000", {
  user: "root",
  pass: "root",
  namespace: "test",
  database: "test"
})
```

Create a new table record:

```
interface Person {
  name: string,
  age: number
}

const p1 = await db.create<Person>("person:1", {
  name: "Max Manus",
  age: 32
})

console.log(p1) // Prints: { age: 32, id: "person:1", name: "Max Manus" }
```

Execute a custom query:

```
const queryResult = await db.query<Person>("SELECT * FROM person WHERE age > 18")
const firstQR = queryResult[0]
const result = firstQR.result
console.log(p1)
// Prints: [ { age: 32, id: "person:1", name: "Max Manus" } ]
```

It is also possible to check for errors with the query from the last example:

```
const queryResult = await db.query<Person>("SELECT * FROM person")
const firstQR = queryResult[0]
if (firstQR.status === "ERR") {
  // Do something...
}
```

Select one or more records from a table:

```
  const result1 = await db.select<Person>("person")
  const result2 = await db.select<Person>("person:1")
```

Delete one or more records from a table:
> Note that delete queries are not typable as they only return true or false
```
  const deleted1 = await db.delete("person")
  const deleted2 = await db.delete("person:1")
  console.log(deleted1, deleted2) // Prints: true false
```

Update a specific record:
```
  const p1 = await db.update<Person>("person:1", {
    age: 98
  })
  console.log(p1) // Prints: { age: 98, id: "person:1", name: "Max Manus" }
```

Modify a specific record:
```
  const p1 = await db.change<Person>("person:1", {
    age: 57
  })
  console.log(p1) // Prints: { age: 57, id: "person:1", name: "Max Manus" }
```