# project_haiku_status_api.iot

The status API service used by Project Haiku and its experiments

This is a simple proof of concept to enable development of prototype clients which can consume status updates. The implementation consists of simple file-system backed attributes served by expressjs


## Install

```
$ cd status-server
$ npm install
```


## Starting Database

Install MongoDB on your computer:

https://docs.mongodb.com/manual/administration/install-on-linux/ (Linux Systems)

https://docs.mongodb.com/manual/tutorial/install-mongodb-on-os-x/ (OS X)

https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/ (Windows)

Then, start up the database using:

```
$ mongod
```

With `haiku-data.json` in your current working directory run this command to import the data:

```
$ mongoimport --db haiku --collection users --drop --file haiku-data.json
```


## Mongo CRUD Operations

First, start up the mongo shell:

```
$ mongo
```

To view all databases:

```
> show dbs
```

Use specific database:

```
> use `db_name`
```

View collections of current database:

```
> show collections
```

View contents of current database:

```
> db.your_collection.find().pretty()
```

Create operations to add new documents to a collection:

```
> db.collection.insert()
> db.collection.insertOne()
> db.collection.insertMany()
```

Read operations to retrieve documents from a collection:

```
> db.collection.find()
```

  Example query to find all users who have status value set to 1 (status is "available"):

  ```
  > db.collection.find({ "status.value": "1" })
  ```

Update operations to modify existing documents in a collection:

```
> db.collection.update()
> db.collection.updateOne()
> db.collection.updateMany()
> db.collection.replaceOne()
```

Delete operations to remove documents from a collection:

```
> db.collection.remove()
> db.collection.deleteOne()
> db.collection.deleteMany()
```

For more detailed examples:

https://docs.mongodb.com/manual/crud/


## Running Server

Run server in test-environment (no authentication required):

```
$ npm start
```

There are TWO ways to run the server in production-environment (authentication required):

  1. Open `config.example.js` replace the empty strings with your respective Github Client Id and Secret:

    ```
    module.exports.info = {
      GITHUB_CLIENT_ID:  process.env.GITHUB_CLIENT_ID || 'your github client id',
      GITHUB_CLIENT_SECRET:  process.env.GITHUB_CLIENT_SECRET || 'your github client secret',
      secret: process.env.secret || 'something'
    }
    ```

  2. Pass the environmental variables from the command line:
  
    ```
    $ GITHUB_CLIENT_ID=123 GITHUB_CLIENT_SECRET=123 COOKIE_SECRET=something npm run production
    ```

Then from the command line run:

```
$ npm run production
```

We're using `nodemon` to watch for changes and the server will automatically restart when files change.


## HTTP API

#### `GET /user/:id/status`

Params:

  - `id` user id

Returns a JSON object with the following fields:
  - `last-modified` the last time the status was modified
  - `value` the current value of the status

#### `PUT /user/:id/status`

Params:

  - `id` user id

Body:

  - `status` the value to store

Returns a JSON object with the following fields:
  - `last-modified` the last time the status was modified
  - `value` the current value of the status

#### `GET /user/:id/message`

Params:

  - `id` user id

Returns a JSON object with the following fields:
  - `last-modified` the last time the message was modified
  - `value` the current value of the message
  - `sender` user id of sender

#### `PUT /user/:id/message`

Params:

  - `id` user id

Body:

  - `message` the message to store
  - `sender` the sender id

Returns a JSON object with the following fields:
  - `last-modified` the last time the message was modified
  - `value` the current value of the message
  - `sender` user id of sender
