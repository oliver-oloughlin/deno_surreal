# deno_surreal

## Simple library for querying a SurrealDB database

**Disclaimer! This project is not meant to be a replacement or contender to any official tools/libraries. It is not stable, and exists merely because I wanted to do a small project involving SurrealDB.**

This library has no dependencies

For documentation on SurrealDB go to the official [SurrealDB Website](https://surrealdb.com)

<br>

Create a SurrealDB connection:
> Make sure it is the base url to your hosted database, and includes the port

> As of now only allows basic authentication
```
import { SurrealDB } from "https://deno.land/x/deno_surreal/mod.ts"

const db = new SurrealDB("http://127.0.0.1:8000", {
  user: "root",
  pass: "root",
  namespace: "test",
  database: "test"
})
```

<br>

Sign in with a different username / password:
> You could also choose to only update one
```
db.signin({
  user: "username",
  pass: "password"
})
```

<br>

Use a different namespace / database:
> You could also choose to only update one
```
db.use({
  namespace: "test2", 
  database: "test2"
})
```

<br>

Create a new table record:
> Typing is optional
```
type Person = {
  id: string
  name: string,
  age: number
}

const p1 = await db.create<Person>("person:1", {
  name: "Max Manus",
  age: 32
})

console.log(p1) // Prints: { age: 32, id: "person:1", name: "Max Manus" }
```

<br>

Select one or more records from a table:

```
  const result1 = await db.select<Person>("person")
  const result2 = await db.select<Person>("person:1")
```

<br>

Delete one or more records from a table:
```
  await db.delete("person")
  await db.delete("person:1")
```

<br>

Update a specific record:
```
  const p1 = await db.update<Person>("person:1", {
    age: 98
  })
  console.log(p1) // Prints: { age: 98, id: "person:1", name: "Max Manus" }
```

<br>

Modify a specific record:
```
  const p1 = await db.modify<Person>("person:1", {
    age: 57
  })
  console.log(p1) // Prints: { age: 57, id: "person:1", name: "Max Manus" }
```

<br>

Execute custom queries:
> Possible to execute multiple queries at once, returns a list of result lists
```
const queryStr = `
SELECT * FROM person;
SELECT * FROM person WHERE age < 18;
`

const [ people, peopleUnder18 ] = await db.query(queryStr)
console.log(people) // Prints: [ { age: 32, id: "person:1", name: "Max Manus" }
console.log(peopleUnder18) // Prints: []
```

<br>

Execute a single custom query:
> Will only execute the first query if multiple are present, returns a single result list
```
const peopleNamedMax = await db.singleQuery<Person>("SELECT * FROM person WHERE name = 'Max Manus'")
console.log(peopleNamedMax) 
// Prints: [ { age: 32, id: "person:1", name: "Max Manus" } ]
```

<br>

Execute custom queries and receive the raw query results:
```
const queryStr = `
SELECT * FROM person;
SELECT * FROM person WHERE age < 18;
`

const queryResults = await db.query(queryStr)
if (!queryResults) {
  // if no results, do something..
} else {
  queryResults.forEach(qr => {
    if (qr.status === "ERR") {
      // Query error, do something..
    } else {
      // Receive and manage the result list
      console.log(qr.result)
    }
  })
}
```