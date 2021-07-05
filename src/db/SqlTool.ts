import { Sequelize } from 'sequelize';
import {config} from '../config/conf';

class SqlTool{

    public static sqlinstance:SqlTool=null;
    public sequelize:Sequelize=null;

    constructor(){
        //dbname,username,password
        this.sequelize = new Sequelize(config.db_name, config.db_username,config.db_password, {
            host: config.db_host,
            port: config.db_port,
            dialect: 'mysql',
            pool: {max:6,min:0,idle: 10000}
        });
    }

    public  static getSingleInstance(){
            if(!SqlTool.sqlinstance){
                SqlTool.sqlinstance=new SqlTool();
            }
            return SqlTool.sqlinstance;
    }
    
    public async auth(){
        try {
            await this.sequelize.authenticate();
            return true;
          } catch (error) {
            return false;
          } finally{
            //this.sequelize.close();  //don't close it !
          }
    }

}

export {
    SqlTool
}