### server_template
server template over nodejs \
Before runing please configure parameters inside \
 ```/src/config/*_config.ts```  

### Running command
####  ```npm install```
### run dev mode test 
#### ```npm run test_dev```
### run prod mode test 
#### ```npm run test_prod```
### generate database tables and test data for dev
#### ```npm run prepare_data_dev```
### generate database tables and test data for prod
#### ```npm run prepare_data_prod```
### production runs on port 80 with command:
#### ```npm run start```
### stop all the started production applications:
#### ```npm run stop```

### dev runs on port 3000 with command:
#### ```npm run dev```


### Submodules:
1.log4js \
2.koa for http server \
3.sequelize for database orm \
4.sql2  \
5.mocha and chai for test \
6.ioredis for redis  \
7.axios for remote request \
8.query-string for easy url parsing \
9.moment for easy timing \
10.string-random 


### Design:
#### production is based on pm2 clusters core which boost multi-cores efficiency
#### dev is based on nodemon 
#### MVC design with controllers
#### test is based on mocha

