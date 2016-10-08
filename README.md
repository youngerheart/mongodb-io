[![NPM version](https://img.shields.io/npm/v/mongodb-io.svg)](https://www.npmjs.com/package/mongodb-io) [![Downloads](https://img.shields.io/npm/dm/mongodb-io.svg)](http://badge.fury.io/js/mongodb-io)

# mongodb-io
export & import mongodb documents, base on `mongodump` and `mongorestore`.

## Support

only for linux x64 and OS X x64.

## Usage

```
import DBIO from 'mongodb-io';
```

#### config

The second argument in `DBIO.export` or `DBIO.import`, params and default value seems like:

```
{
  host: 127.0.0.1,
  port: 27017,
  user,
  password,
  out: 'dump', // export filename
  drop: false, // Before restoring the collections from the dumped backup, drops the collections from the target database.
  filePath: '' // path to read `tar.gz` file for mongorestore.
}
```

#### export

```
var filePath = await DBIO.export({config, dbs}); // this is a `tar.gz` file
```

if `dbs` is not a array, will export all dbs. `dbs` is seems like:

```
['dbName1', {name: 'dbName2', collections}, ...]
``` 
the array of database names, or database settings you want to export.

`collections` is seems like:

```
['collectionName1', {name: 'collectionName2', query: '{_id: 111}'}, ...]
```

the array of collection names, or collection settings you want to export.

#### import

```
await DBIO.import({config, dbs});
```

In each item of dbs or collections you could set `drop`, like that item in config.

#### errors

```
Error: {name: 'DBIO_XXX_ERR', message: 'where error happend'}
```
