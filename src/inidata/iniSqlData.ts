/*
 * @Author: your name
 * @Date: 2021-07-07 10:47:59
 * @LastEditTime: 2021-07-21 12:58:23
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /hotcatserver/src/inidata/iniSqlData.ts
 */
import { SqlTool } from "../db/SqlTool";
import { logger } from "../global";
import { categoryModel, categoryModel_createData } from "../model/categoryModel";
import { configModel, configModel_createData } from "../model/configModel";
import { livestreamModel_createData } from "../model/livestreamModel";
import { regionMapConfigModel_createData } from "../model/regionMapConfigModel";
import { regionServerConfigModel_createData } from "../model/regionServerConfigModel";
import { userModel, userModel_createData } from "../model/userModel";

class iniSqlData {
    public static async IniSqlTables() {
        //connect test first
        if (!(await SqlTool.getSingleInstance().auth())) {
            logger.error("database not connected!");
        }

        //create all the  imported tables if exist will not overwrite
        await SqlTool.getSingleInstance().sequelize.sync({ force: true });

        //insert all test data into database
        await userModel_createData();
        await livestreamModel_createData();
        await categoryModel_createData();
        await configModel_createData();
        await regionServerConfigModel_createData();
        await regionMapConfigModel_createData();
    }
}

export { iniSqlData };
