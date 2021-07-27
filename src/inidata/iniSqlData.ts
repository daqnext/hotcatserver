 import {SqlTool} from "../db/SqlTool"
 import {logger} from "../global"
 import {testModel,testModel_createData} from "../model/testModel"
 
 class iniSqlData{

    public static async IniSqlTables(){

      //connect test first
      if(!await SqlTool.getSingleInstance().auth()){
         logger.error("database not connected!");
      }

      //create all the  imported tables if exist will not overwrite
      await SqlTool.getSingleInstance().sequelize.sync({force:false});

      
      //insert all test data into database 
      await testModel_createData();
      
    }
 }

 export{
    iniSqlData
 }