// import fs from 'fs';
import {execSync} from 'child_process';
// import {platform} from 'process';

const setConfig = (config = {}) => {
  var defaultConfig = {
    host: '127.0.0.1',
    port: 27017,
    user: '',
    password: '',
    out: 'dump', // export filename
    drop: false
  };
  for (let key in defaultConfig) {
    config[key] = config[key] || defaultConfig[key];
  }
  return config;
};

const is = (obj, type) => typeof obj === type;

export default {
  // ['dbName1', {name: 'dbName2', collections}, ...]
  // ['collectionName1', {name: 'collectionName1', query: {_id: 111}, ...]
  export(dbs, config) {
    var cmds = [];
    config = setConfig(config);

    const getCmd = ({dbName, collectionName, query}) => {
      let {host, port, user, password, out} = config;
      let cmd = `mongodump -h ${host} -o /tmp/${out} --port ${port}`;
      if (user) cmd += ` -u ${user}`;
      if (password) cmd += ` -p ${password}`;
      if (dbName) cmd += ` -d ${dbName}`;
      if (collectionName) cmd += ` -c ${collectionName}`;
      if (query) cmd += ` -q '${JSON.stringify(query)}'`;
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
        }
      }
      try {
        // 打包为 tar.gz
        execSync(`tar zcvf ${config.out}.tar.gz ${config.out}`, {cwd: '/tmp'});
        // 删除文件夹
        execSync(`rm -rf ${config.out}`, {cwd: '/tmp'});
      } catch (err) {
        reject(err);
      }
      resolve(`/tmp/${config.out}.tar.gz`);
    });
  },
  import(filePath, config) {
    config = setConfig(config);
    var {host, port, user, password, out, drop} = config;
    var cmd = `mongorestore -h ${host} --port ${port} /tmp/${out}`;
    if (user) cmd += ` -u ${user}`;
    if (password) cmd += ` -p ${password}`;
    if (drop) cmd += ' --drop';
    return new Promise((resolve, reject) => {
      try {
        // 解压到当前目录
        execSync(`tar -zxvf ${filePath}`, {cwd: '/tmp'});
        execSync(cmd, {cwd: '/tmp'});
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }
};
