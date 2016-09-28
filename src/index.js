const {exec, execSync} = require('child_process');
const cmdName = process.platform === 'linux' ? ['mongorestore-linux', 'mongodump-linux'] : ['mongorestore', 'mongodump'];

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

const getCmds = (config, dbs, isImport) => {
  var cmds = [];
  var getCmd = ({dbName, collectionName, query} = {}) => {
    let {host, port, user, password, out} = config;
    let cmd = (isImport ? `${__dirname}/../${cmdName[0]}` : `${__dirname}/../${cmdName[1]}`) + ` -h ${host} --port ${port}`;
    if (!isImport) cmd += ` -o /tmp/${out}`;
    if (user) cmd += ` -u ${user}`;
    if (password) cmd += ` -p ${password}`;
    if (dbName) cmd += ` -d ${dbName}`;
    if (collectionName) cmd += ` -c ${collectionName}`;
    if (query) cmd += ` -q '${query}'`;
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
  return cmds;
};

module.exports = {
  // ['dbName1', {name: 'dbName2', collections}, ...]
  // ['collectionName1', {name: 'collectionName1', query: {_id: 111}, ...]
  export({config, dbs} = {}) {
    config = setConfig(config);
    var cmds = getCmds(config, dbs);
    execSync(`rm -rf '${config.out}'`, {cwd: '/tmp'});
    return new Promise((resolve, reject) => {
      for (let index = 0; index < cmds.length; index++) {
        try {
          execSync(cmds[index]);
        } catch (err) {}
      }
      // 打包为 tar.gz
      exec(`tar zcvf '${config.out}.tar.gz' '${config.out}'`, {cwd: '/tmp'}, (err, out, stderr) => {
        process.stderr.write(out + stderr + '\n');
        if (err) reject(err);
        // 删除文件夹
        exec(`rm -rf '${config.out}'`, {cwd: '/tmp'}, (err, out, stderr) => {
          process.stderr.write(out + stderr + '\n');
          if (err) reject(err);
          resolve(`/tmp/${config.out}.tar.gz`);
        });
      });
    });
  },
  import({config, dbs} = {}) {
    config = setConfig(config);
    var cmds = getCmds(config, dbs, true);
    var {filePath} = config;
    return Promise.all(cmds.map((cmd) => {
      return new Promise((resolve, reject) => {
        // 解压到当前目录
        exec(`tar -zxvf '${filePath}'`, {cwd: '/tmp'}, (err, out, stderr) => {
          process.stderr.write(out + stderr + '\n');
          if (err) reject(err);
          exec(cmd, {cwd: '/tmp'}, (err, out, stderr) => {
            process.stderr.write(out + stderr + '\n');
            if (err) reject(err);
            resolve();
          });
        });
      });
    }));
  }
};
