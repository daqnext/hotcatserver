/*
 * @Author: your name
 * @Date: 2021-07-13 15:50:18
 * @LastEditTime: 2021-07-13 15:58:10
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /hotcatserver/src/model/configModel.ts
 */
import { SqlTool } from "../db/SqlTool";
import { DataTypes, Model } from "sequelize";
import { ICategory } from "../interface/interface";

const sqlSequelize = SqlTool.getSingleInstance().sequelize;
class configModel extends Model {
    cdnDomain: string;
    userLivestreamCountLimit: number;
    eachLivestreamDurationLimitSecond: number;
}

configModel.init(
    {
        cdnDomain: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        userLivestreamCountLimit: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        eachLivestreamDurationLimitSecond: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    },
    {
        underscored: true,
        timestamps: true,
        paranoid: false,

        freezeTableName: true,
        tableName: "config",

        sequelize: sqlSequelize,
    }
);

const configModel_createData = async function () {
    await configModel.findOrCreate({
        where: {
            cdnDomain: "https://coldcdn.com",
            userLivestreamCountLimit: 10,
            eachLivestreamDurationLimitSecond: 36000,
        },
    });
};

export { configModel, configModel_createData };
