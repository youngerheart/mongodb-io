import DBIO from './src/index';

const dbs = [{
  name: 'jobs',
  collections: [{name: 'resumes', query: {practice: true}}]
}];

DBIO.export(dbs).then((filePath) => {
  process.stderr.write('export is ok\n');
  DBIO.import('/tmp/dump.tar.gz').then(() => {
    process.stderr.write('import is ok\n');
  });
});
