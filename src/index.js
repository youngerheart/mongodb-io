import fs from 'fs';
import {execSync} from 'child_process';

const setConfig = (config = {}) => {
  var defaultConfig = {
    host: '127.0.0.1',
    port: 27017,
    user: '',
    password: '',
    out: 'dump' // export filename
  };
  for (let key in defaultConfig) {
    config[key] = config[key] || defaultConfig[key];
  }
};

const is = (obj, type) => typeof obj === type;

export default {
  // ['dbName1', {name: 'dbName2', collections}, ...]
  // ['collectionName1', {name: 'collectionName1', query: {_id: 111}, ...]
  async export(dbs, config) {
    var cmds = [];
    setConfig(config);

    const getCmd = ({dbName, collectionName, query}) => {
      let {host, port, user, password, out} = config;
      let cmd = `mongodump -h ${host} -o /tmp/${out} --port ${port}`;
      if (user) cmd += ` -u ${user}`;
      if (password) cmd += ` -p ${password}`;
      if (dbName) cmd += ` -d ${dbName}`;
      if (collectionName) cmd += ` -u ${collectionName}`;
      if (query) cmd += ` -u ${JSON.stringify(query)}`;
      return cmd;
    };

    if (!Array.isArray(dbs)) {
      cmds.push(getCmd());
    } else {
      dbs.forEach((db) => {
        if (is(db, 'string')) cmds.push(getCmd({dbName: db}));
        else if (is(db, 'object')) {
          let {name: dbName, collections} = db;
          if (!Array.isArray(collections)) cmds.push(getCmd({dbName}));
          else {
            collections.forEach((collection) => {
              if (is(collection, 'string')) cmds.push(getCmd({dbName, collectionName: collection}));
              else if (is(collection, 'object')) {
                let {name: collectionName, query} = collection;
                cmds.push(getCmd({dbName, collectionName, query}));
              }
            });
          }
        }
      });
    }
    return new Promise((resolve, reject) => {
      for (let index = 0; index < cmds.length; index++) {
        try {
          execSync(cmds[index]);
        } catch (err) {
          reject(err);
          break;
        }
        if (index === cmds.length - 1) resolve();
      }
    });
  },
  async import(filePath, config) {
    return new Promise((resolve, reject) => {
      resolve();
    });
  }
};
