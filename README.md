# deno_surreal

**Disclaimer! This project is not meant to be a replacement or contender to any official tools/libraries. It is not stable, and exists merely because I wanted to do a small project involving SurrealDB.**

Simple and lightweight module for querying a SurrealDB database.

This module has no dependencies.

Updated for beta-8 release.

For documentation on SurrealDB go to the official [SurrealDB Website](https://surrealdb.com).

<br><br>

## Authentication

<br>

Create a SurrealDB instance with connection info:

> As of now, only allows basic authentication.
```
import { SurrealDB } from "https://deno.land/x/deno_surreal/mod.ts"

const db = new SurrealDB({
  host: "localhost",
  port: 8000, // Will default to 8000 if not specified
  user: "root",
  pass: "root",
  namespace: "test",
  database: "test"
})
```

<br>

Update username / password:
> You could also choose to only update one.
```
db.signin({
  user: "username",
  pass: "password"
})
```

<br>

Use a different namespace / database:
> You could also choose to only update one.
```
db.use({
  namespace: "test2", 
  database: "test2"
})
```

<br><br>

## Defining Models

<br>

For type safety, models can be explicitly defined as such:
> Models represent the database record, they must include the id attribute
```
type Person = {
  name: string,
  age: number,
  id: string
}
```

<br>

Can also create interfaces that extend the Model interface, which includes id:
> Will not provide as strict typing as types
```
import { Model } from "https://deno.land/x/deno_surreal/mod.ts"

interface IPerson extends Model {
  name: string,
  age: number
}
```

<br><br>

## Fixed Queries

<br>

Create a new table record:
> Typing is optional.

> All requests will throw an error upon receiving an error result from the database. This is less likely to happen with fixed queries.
```
const p1 = await db.create<Person>("person:1", {
  name: "Max Manus",
  age: 32
})

console.log(p1) // Prints: { age: 32, id: "person:1", name: "Max Manus" }
```

<br>

Select one or more records from a table:

```
const people = await db.select<Person>("person")
const [ person1 ] = await db.select<Person>("person:1")
```

<br>

Delete one or more records from a table:
```
await db.delete("person")   // Delete all people
await db.delete("person:1") // Only delete person with id = "person:1"
```

<br>

Update a specific record:
```
const p1 = await db.update<Person>("person:1", {
  name: "Maxy",
  age: 98
})
console.log(p1) // Prints: { age: 98, id: "person:1", name: "Maxy" }
```

<br>

Modify a specific record:
```
const p1 = await db.modify<Person>("person:1", {
  age: 57
})
console.log(p1) // Prints: { age: 57, id: "person:1", name: "Max Manus" }
```

<br><br>

## Custom Queries

<br>

Execute mutiple custom queries:
> Can execute multiple queries in one request, returns a list of result lists.
```
const queryStr = `
  SELECT * FROM person;
  SELECT * FROM person WHERE age < 18;
`

try {
  const [ people, peopleUnder18 ] = await db.queries(queryStr)
  console.log(people) // Prints: [ { age: 32, id: "person:1", name: "Max Manus" }
  console.log(peopleUnder18) // Prints: []
} 
catch (err) {
  console.error(err)
}
```

<br>

Execute a single custom query:
> Will only execute the first query if multiple are present, returns a single result list.
```
try {
  const peopleNamedMax = await db.query<Person>("SELECT * FROM person WHERE name = 'Max Manus'")
  console.log(peopleNamedMax) 
  // Prints: [ { age: 32, id: "person:1", name: "Max Manus" } ]
} 
catch (err) {
  console.error(err)
}
```

<br>

Execute custom queries and receive the raw query results:
> Will retain erronous query results.
```
const queryStr = `
SELECT * FROM person;
SELECT * FROM person WHERE age < 18;
`

try {
  const queryResults = await db.rawQueries(queryStr)
  queryResults.forEach(qr => {
    if (qr.status === "ERR") {
      // Handle erronous result
    }
    else {
      const result =  qr.result
    }
  })
} 
catch (err) {
  console.error(err)
}
```

<br><br>

## Query Building

<br>

Build and execute queries using the query builder:
```
const qb = db.queryBuilder()
```

```
try {
  const selected = await qb.select("age", "name", "id")
    .from("person", "animal")
    .where("age", ">=", 12)
    .where("name", "CONTAINS", "e")
    .groupBy("name", "age")
    .orderBy("age", "DESC")
    .limit(5)
    .execute()
}
catch (err) {
  console.error(err)
}
```

```
try {
  const updated = await qb.update<Person>("person", {
      name: "Oliver",
      age: 23
    })
    .where("age", "!=", 23)
    .return("BEFORE")
    .execute()
}
catch (err) {
  console.error(err)
}
```

```
try {
  const updated = await qb.set("person:1", {
      age: ["+=", 1],
      name: ["=", "Thomas"]
    })
    .return("FIELDS", "age", "name")
    .execute()
}
catch (err) {
  console.error(err)
}
```

```
try {
  const deleted = await qb.delete<Person>("person")
    .where("age", "<", 18)
    .return("BEFORE")
    .execute()
}
catch (err) {
  console.error(err)
}
```