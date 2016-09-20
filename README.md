# mongodb-io
export & import mongodb documents, base on mongodump and mongorestore.

## Usage

```
import DBIO from 'mongodb-io';

#### config

The second argument in `DBIO.export` or `DBIO.import`, params and default value seems like:

```
{
  host: 127.0.0.1,
  port: 27017,
  user,
  password,
  out: 'dump' // export filename
}
```

#### export

```
var filePath = await DBIO.export(dbs, config); // this is a `tar.gz` file
```

if `dbs` is undefined, will export all dbs. `dbs` is seems like:

```
['dbName1', {name: 'dbName2', collections}, ...]
``` 
the array of database names, or database settings you want to export

`collections` is seems like:

```
['collectionName1', {name: 'collectionName1', query: {"_id": "111"}, fields: 'field1,field2'}, ...]
```

the array of collection names, or collection settings you want to export。

#### import

```
await DBIO.import(filePath, config); // import a `tar.gz` file
```

#### errors

```
Error: {name: 'DBIO_XXX_ERR', message: 'where error happend'}
```
