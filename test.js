import DBIO from './src/index';

const dbs = ['jobs', {name: 'esrc'}]

const config = {}

DBIO.export(dbs, config).then((filePath) => {

});
