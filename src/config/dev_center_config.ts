/*
 * @Author: your name
 * @Date: 2021-07-07 10:47:59
 * @LastEditTime: 2021-07-09 10:43:20
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /hotcatserver/src/config/dev_config.ts
 */
module.exports = {
  //log-level
  loglevel:'DEBUG',
  logfilename:'dev.log',
  logtypes:['console', 'file'],
  /// server port 
  port: 7000,

  //sqldb 
  db_host:'localhost',
  db_port:'3306',
  db_username:'root',
  db_password:'123456',
  db_name:'hotcat',

  //redis
  redis_host:'127.0.0.1',
  redis_port:6379,
  redis_password:"123456",
  redis_db:3,
  redis_family:4,

  //cache
  cache_prefix:'hotcat_dev_'
  
};

