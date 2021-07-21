/*
 * @Author: your name
 * @Date: 2021-07-21 09:40:07
 * @LastEditTime: 2021-07-21 09:59:51
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /hotcatserver/src/model/regionMapConfigModel.ts
 */
import { SqlTool } from "../db/SqlTool";
import { DataTypes, Model } from "sequelize";

const sqlSequelize = SqlTool.getSingleInstance().sequelize;
class regionMapConfigModel extends Model {
    areaName:string  //country or continent
    region:string //region
}

regionMapConfigModel.init(
    {
        areaName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        region: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        underscored: true,
        timestamps: true,
        paranoid: false,

        freezeTableName: true,
        tableName: "region_map_config",

        sequelize: sqlSequelize,
    }
);

        // Asia: ERegion.Asia,
        // Oceania: ERegion.NorthAmerica,
        // Africa: ERegion.NorthAmerica,
        // Europe: ERegion.Europe,
        // "North America": ERegion.NorthAmerica,
        // "South America": ERegion.NorthAmerica,
        // unknown: ERegion.NorthAmerica,

const regionMapConfigModel_createData = async function () {
    await regionMapConfigModel.findOrCreate({
        where: {
            areaName: "Asia",
            region:"ap-northeast-2c"
        },
    });
    await regionMapConfigModel.findOrCreate({
        where: {
            areaName: "Oceania",
            region:"us-west-1c"
        },
    });
    await regionMapConfigModel.findOrCreate({
        where: {
            areaName: "Africa",
            region:"us-west-1c"
        },
    });
    await regionMapConfigModel.findOrCreate({
        where: {
            areaName: "Europe",
            region:"eu-west-2a"
        },
    });
    await regionMapConfigModel.findOrCreate({
        where: {
            areaName: "North America",
            region:"us-west-1c"
        },
    });
    await regionMapConfigModel.findOrCreate({
        where: {
            areaName: "South America",
            region:"us-west-1c"
        },
    });
    await regionMapConfigModel.findOrCreate({
        where: {
            areaName: "unknown",
            region:"us-west-1c"
        },
    });
};

export { regionMapConfigModel, regionMapConfigModel_createData };