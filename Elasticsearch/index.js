'use strict';

/**
 * Created by baohg on 27/05/2016.
 */

var es = require('elasticsearch');

// Set ElasticSearch location and port


var index = "abulk";
var type = "abulk";
//var xlopp = 15357;
var xlopp = 1000000;

var client;
connectElastic()
function connectElastic(callback) {
  //if already we have a connection, don't connect to database again
  if (client) {
    callback(client);
    return;
  }

  //var host = "pixel.mobo.vn";
  var host = "localhost";
  var port = "9200";
  var connectionString = `${host}:${port}`;

  client = new es.Client({
    host: connectionString,
    log: 'error'
  });

  client.delete({
    index: 'example_index',
    type: 'posts',
    id: '1',
  })

  //client.search({
  //  index: 'example_index',
  //  type: 'posts',
  //  body: {
  //    query: {
  //      match: {
  //        message: 'Hello World'
  //      }
  //    }
  //  }
  //}, (error, data) => {
  //  console.log(JSON.stringify(data, null, 4));
  //});

console.time("data");
  client.index({
    index: 'example_index',
    type: 'posts',
    id: '1',
    body: {
      user: 'me',
      post_date: new Date(),
      message: 'Hello World!'
    },
    refresh: true
  }, (error, data) => {
    //console.log(data);
    client.search({
      index: 'example_index',
      type: 'posts',
      body: {
        query: {
          match: {
            message: 'Hello World'
          }
        }
      }
    }, (error, data) => {
      console.timeEnd("data");
      //console.log(a);
      //console.log(JSON.stringify(data, null, 4));

    });
  });

  //client.search({
  //  index: 'example_index',
  //  type: 'posts',
  //  body: {
  //    query: {
  //      match: {
  //        message: 'Hello World'
  //      }
  //    }
  //  }
  //}, (error, data) => {
  //  console.log(JSON.stringify(data, null, 4));
  //});

  //client.ping({
  //  requestTimeout: Infinity,
  //  hello: "elasticsearch!"
  //}, function (error) {
  //  if (error) {
  //    console.error('[ELASTICSEARCH] cluster is down!');
  //  } else {
  //    console.info('[ELASTICSEARCH] connection is ok');
  //  }
  //});
  //callback(client);
};

//index without bulk
function index_without_bulk() {
  for (var i = 0; i < xlopp; i++) {
    var obj = {a: 1, b: 2, c: i};
    connectElastic(function (client) {
      client.index({
        index: index,
        type: type,
        body: obj,
        refresh: true
      }, function (error, response, status) {
        if (error) {
          console.log(error);
        }
        //console.log(response._id);
      });
    });
  }
}


//index with bulk
function index_with_bulk() {
  var bulk_request = [];
  for (var i = 0; i < xlopp; i++) {
    var obj = {a: 1, b: 2, c: i};
    bulk_request.push({index: {_index: index, _type: type}});
    bulk_request.push(obj);
  }
  console.log("done gen");

  var len = 10000;
  while (bulk_request.length > 0) {
    var bk = bulk_request.splice(0, len);
    connectElastic(function (client) {
      client.bulk({
        body: bk
      }, function (error, response, status) {
        if (error) {
          console.log(error);
        }
      });
    });
  }
}

//index_without_bulk();
//index_with_bulk();



