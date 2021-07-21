/*
 * @Author: your name
 * @Date: 2021-07-21 14:11:02
 * @LastEditTime: 2021-07-21 14:26:19
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /hotcatserver/src/model/regionRedisConfigModel.ts
 */
import { SqlTool } from "../db/SqlTool";
import { DataTypes, Model } from "sequelize";

const sqlSequelize = SqlTool.getSingleInstance().sequelize;
class regionRedisConfigModel extends Model {
    region:string  
    host:string
    port:number
    auth:string
    db:number
}

regionRedisConfigModel.init(
    {
        regionName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        host: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        port: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        auth: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        db: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    },
    {
        underscored: true,
        timestamps: true,
        paranoid: false,

        freezeTableName: true,
        tableName: "region_redis_config",

        sequelize: sqlSequelize,
    }
);

const regionRedisConfigModel_createData = async function () {
    await regionRedisConfigModel.findOrCreate({
        where: {
            region:"us-west-1c",  
            host:"region-meson-redis.vktrsm.0001.usw1.cache.amazonaws.com",
            port:6379,
            auth:null,
            db:5
        },
    });
    await regionRedisConfigModel.findOrCreate({
        where: {
            region:"ap-northeast-2c",  
            host:"meson-region-redis.tphucg.0001.apn2.cache.amazonaws.com",
            port:6379,
            auth:null,
            db:5
        },
    });
    await regionRedisConfigModel.findOrCreate({
        where: {
            region:"eu-west-2a",  
            host:"london-meson-redis.hk9eor.0001.euw2.cache.amazonaws.com",
            port:6379,
            auth:null,
            db:5
        },
    });
};

export { regionRedisConfigModel, regionRedisConfigModel_createData };