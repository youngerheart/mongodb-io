const DBIO = require('./src/index');

const dbs = [{
  name: 'jobs',
  collections: [{name: 'resumes', query: '{practice: true}'}]
}];

DBIO.export({dbs}).then((filePath) => {
  process.stderr.write('export is ok\n');
  DBIO.import({
    config: {filePath}
  }).then(() => {
    process.stderr.write('import is ok\n');
  }).catch((err) => {
    process.stderr.write(`${err}\n`);
  });
}).catch((err) => {
  process.stderr.write(`${err}\n`);
});
