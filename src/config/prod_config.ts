module.exports = {
  //log-level
  loglevel:'DEBUG',
  logfilename:'prod.log',
  logtypes:['console','file'],
  /// server port 
  port: 80,

  //sqldb 
  db_host:'localhost',
  db_port:'3306',
  db_username:'root',
  db_password:'',
  db_name:'hotcat',

  //redis
  redis_host:'127.0.0.1',
  redis_port:6379,
  redis_password:"",
  redis_db:0,
  redis_family:4,

  //cache
  cache_prefix:'hotcat_prod_'
 
};

