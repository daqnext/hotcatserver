/*
 * @Author: your name
 * @Date: 2021-07-09 11:53:50
 * @LastEditTime: 2021-07-15 12:11:01
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /hotcatserver/src/model/categoryModel.ts
 */
import { SqlTool } from "../db/SqlTool";
import { DataTypes, Model } from "sequelize";
import { ICategory } from "../interface/interface";

const sqlSequelize = SqlTool.getSingleInstance().sequelize;
class categoryModel extends Model implements ICategory {
    id: number;
    category: string;
    subCategory: string;
}

categoryModel.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            unique: true,
            primaryKey: true,
            allowNull: false,
        },
        category: {
            type: DataTypes.STRING(32),
            allowNull: false,
        },
        subCategory: {
            type: DataTypes.STRING(32),
            allowNull: false,
        },
    },
    {
        underscored: true,
        timestamps: true,
        paranoid: false,

        freezeTableName: true,
        tableName: "category",

        sequelize: sqlSequelize,
    }
);

const categoryModel_createData = async function () {
    await categoryModel.findOrCreate({
        where: {
            category: "Crypto",
            subCategory: "",
        },
    });
    await categoryModel.findOrCreate({
        where: {
            category: "Games",
            subCategory: "",
        },
    });
    await categoryModel.findOrCreate({
        where: {
            category: "Sports",
            subCategory: "",
        },
    });
    await categoryModel.findOrCreate({
        where: {
            category: "Technology",
            subCategory: "",
        },
    });
};

export { categoryModel, categoryModel_createData };
