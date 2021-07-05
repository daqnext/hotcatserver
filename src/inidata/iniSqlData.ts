 import {SqlTool} from "../db/SqlTool"
 import {logger} from "../global"
 import {userModel,userModel_createData} from "../model/userModel"
 
 class iniSqlData{

    public static async IniSqlTables(){

      //connect test first
      if(!await SqlTool.getSingleInstance().auth()){
         logger.error("database not connected!");
      }

      //create all the  imported tables if exist will not overwrite
      await SqlTool.getSingleInstance().sequelize.sync({force:true});

      
      //insert all test data into database 
      await userModel_createData();
      
    }
 }

 export{
    iniSqlData
 }