/**
 * Created by validity on 10/14/13.
 */
var        Nano = require('nano');
var         csv = require('csv');
var           _ = require('lodash');
var           Q = require('q');

var args = {};

var nano = Nano(args.url);
var db = nano.db.use(args.db);

function csv2couch() {
  console.log('Loading file: ' + args.file + ' into: ' + args.url + '/' + args.db);
  loadCsv()
    .then(updateDocDate)
    .then(bulkUpdate)
    .then(function() {
      console.log('done');
    });
}

function loadCsv() {
  var deferred = Q.defer();

  var contents = [];
  csv()
    .from.path(f, {
      columns: true,
      delimeter: ',',
      quote: '"'
    })
    .on('record', function(row, index) {
      contents.push(row);
    })
    .on('end', function() {
      deferred.resolve(contents);
    })
    .on('error', function(error) {
      deferred.reject(error);
    });

  return deferred.promise;
}

function bulkUpdate(docs) {
  var deferred = Q.defer();
  db.bulk(
    { docs: docs },
    responsePromise(deferred, 'bulkUpdate'));
  return deferred.promise;
}

function responsePromise(deferred, DEBUG) {
  return function(err, body) {
    if (err) {
      console.log(DEBUG + ' ERROR: ' + err);
      deferred.reject(err);
    }
    else {
      var data = (_.isArray(body))? body : body.rows;
      console.log(DEBUG + ' records: ' + data.length);
      deferred.resolve(data);
    }
  }
}

if (process.argv.length < 4) {
  console.log("");
  console.log(" ***************************************************************");
  console.log(" ***             tvalletta - CSV to CouchDB                  ***");
  console.log(" ***************************************************************");
  console.log("");
  console.log("Usage: node csv2couch <file> <couch url> <couchdb>");
  console.log("");
  console.log(process.argv.length);
}
else {
  args.file = process.argv[2];
  args.url = process.argv[3];
  args.db = process.argv[4];
  csv2couch();
}


