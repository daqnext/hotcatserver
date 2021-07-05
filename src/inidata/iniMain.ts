import {iniSqlData} from './iniSqlData'
import {SqlTool} from '../db/SqlTool'

class iniMain{
        public static initialize(){
                iniSqlData.IniSqlTables().then(()=>{
                        //don't forget to close it as we won't use it in iniMain process any more
                        SqlTool.getSingleInstance().sequelize.close();
                });
        }
}

iniMain.initialize();