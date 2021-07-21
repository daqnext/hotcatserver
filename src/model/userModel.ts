/*
 * @Author: your name
 * @Date: 2021-07-07 10:47:59
 * @LastEditTime: 2021-07-21 15:05:24
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /hotcatserver/src/model/userModel.ts
 */
import { SqlTool } from "../db/SqlTool";
import { DataTypes, Model } from "sequelize";
import { userManager } from "../manager/project/userManager";
import { IUserInfo } from "../interface/interface";
import moment from "moment";

const sqlSequelize=SqlTool.getSingleInstance().sequelize
class userModel extends Model implements IUserInfo {
  id: number;
  name: string;
  email: string;
  password:string;
  cookie: string;
  permission: string[];
  created:number;
  // avatarUrl:string;
}

userModel.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      unique: true,
      primaryKey: true,
      allowNull: false,
    },
    cookie: {
      type: DataTypes.STRING(32),
      unique: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(32),
      unique: true,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(64),
      unique: true,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    permission: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    created:{
      type: DataTypes.BIGINT,
      defaultValue:0,
      allowNull: false,
    },
    // avatarUrl:{
    //   type: DataTypes.STRING,
    //   defaultValue:"",
    //   allowNull: false,
    // }
  },
  {
    underscored: true,
    timestamps: true,
    paranoid: false,

    freezeTableName: true,
    tableName: 'users',

    sequelize:sqlSequelize,
  }
);

const userModel_createData = async function () {
  await userModel.findOrCreate({
    where: {
      cookie: "fYcFuLYFCf+uZRU2",
      name: "admin",
      email: "admin@hotcat.live",
      password: userManager.genMd5password("abc123"),
      created:moment.now(),
      permission: JSON.stringify(["admin"]),
    },
  });
  await userModel.findOrCreate({
    where: {
      cookie: userManager.genCookie(),
      name: "testuser",
      email: "testuser@gmail.com",
      password: userManager.genMd5password("abc123"),
      created:moment.now(),
      permission: JSON.stringify([]),
    },
  });
  await userModel.findOrCreate({
    where: {
      cookie: userManager.genCookie(),
      name: "leo",
      email: "leo@gmail.com",
      password: userManager.genMd5password("abc123"),
      created:moment.now(),
      permission: JSON.stringify([]),
    },
  });
  await userModel.findOrCreate({
    where: {
      cookie: "zh76Luk98jNKW3hF",
      name: "zzb",
      email: "zhangzhengbo@hotmail.com",
      password: userManager.genMd5password("123456"),
      created:moment.now(),
      permission: JSON.stringify([]),
    },
  });
};

export { userModel, userModel_createData };
