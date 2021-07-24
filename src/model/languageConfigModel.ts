/*
 * @Author: your name
 * @Date: 2021-07-09 11:53:50
 * @LastEditTime: 2021-07-23 10:52:51
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /hotcatserver/src/model/categoryModel.ts
 */
import { SqlTool } from "../db/SqlTool";
import { DataTypes, Model } from "sequelize";
import { ICategory } from "../interface/interface";

const sqlSequelize = SqlTool.getSingleInstance().sequelize;
class languageConfigModel extends Model {
    language: string;
    localName:string;
}

languageConfigModel.init(
    {
        language: {
            type: DataTypes.STRING(32),
            allowNull: false,
        },
        localName: {
            type: DataTypes.STRING(32),
            allowNull: false,
        },
    },
    {
        underscored: true,
        timestamps: true,
        paranoid: false,

        freezeTableName: true,
        tableName: "language_config",

        sequelize: sqlSequelize,
    }
);

const languageConfigModel_createData = async function () {
    await languageConfigModel.findOrCreate({
        where: {
            language: "English",
            localName:"English"
        },
    });
    await languageConfigModel.findOrCreate({
        where: {
            language: "Japanese",
            localName:"日本語"
        },
    });
    await languageConfigModel.findOrCreate({
        where: {
            language: "Korean",
            localName:"한국어"
        },
    });
    await languageConfigModel.findOrCreate({
        where: {
            language: "Spanish",
            localName:"Español"
        },
    });
    await languageConfigModel.findOrCreate({
        where: {
            language: "Russian",
            localName:"русский"
        },
    });
};

export { languageConfigModel, languageConfigModel_createData };
