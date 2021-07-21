/*
 * @Author: your name
 * @Date: 2021-07-21 08:48:40
 * @LastEditTime: 2021-07-21 09:53:51
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /hotcatserver/src/model/regionServerModel.ts
 */
import { SqlTool } from "../db/SqlTool";
import { DataTypes, Model } from "sequelize";

const sqlSequelize = SqlTool.getSingleInstance().sequelize;
class regionServerConfigModel extends Model {
    region: string;
    storageServerAddress:string;
    rtmpServerAddress:string;
}

regionServerConfigModel.init(
    {
        region: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        storageServerAddress: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        rtmpServerAddress: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        underscored: true,
        timestamps: true,
        paranoid: false,

        freezeTableName: true,
        tableName: "region_server_config",

        sequelize: sqlSequelize,
    }
);

const regionServerConfigModel_createData = async function () {
    await regionServerConfigModel.findOrCreate({
        where: {
            region: "local test",
            storageServerAddress:"http://192.168.56.101",
            rtmpServerAddress:"rtmp://192.168.56.101",
        },
    });
    await regionServerConfigModel.findOrCreate({
        where: {
            region: "us-west-1c",
            storageServerAddress:"https://us_west_1c_s.hotcat.live",
            rtmpServerAddress:"rtmp://us_west_1c_r.hotcat.live",
        },
    });
    await regionServerConfigModel.findOrCreate({
        where: {
            region: "eu-west-2a",
            storageServerAddress:"https://eu_west_2a_s.hotcat.live",
            rtmpServerAddress:"rtmp://eu_west_2a_r.hotcat.live",
        },
    });
    await regionServerConfigModel.findOrCreate({
        where: {
            region: "ap-northeast-2c",
            storageServerAddress:"https://ap_northeast_2c_s.hotcat.live",
            rtmpServerAddress:"rtmp://ap_northeast_2c_r.hotcat.live",
        },
    });
};

export { regionServerConfigModel, regionServerConfigModel_createData };