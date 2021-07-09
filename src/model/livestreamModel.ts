/*
 * @Author: your name
 * @Date: 2021-07-08 14:19:10
 * @LastEditTime: 2021-07-08 14:39:42
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /hotcatserver/src/model/livestreamModel.ts
 */

import { SqlTool } from "../db/SqlTool";
import { DataTypes, Model } from "sequelize";
import { userManager } from "../manager/project/userManager";
import { ILiveStream, IUserInfo } from "../interface/interface";
import moment from "moment";

const sqlSequelize=SqlTool.getSingleInstance().sequelize
class livestreamModel extends Model implements ILiveStream {
    id:number;
    name:string;
    userId:number;
    userName:string;
    streamKey:string;
    status:"ready"|"onLive"|"end"|"pause";
    duration:number //second
    createTimeStamp:number;
    startTimeStamp:number;
    endTimeStamp:number;
    trmpLink:string;
    originM3u8Link:string;
    cdnM3u8Link:string;
}

livestreamModel.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      unique: true,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(32),
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    userName: {
        type: DataTypes.STRING(32),
        allowNull: false,
    },
    streamKey: {
        type: DataTypes.STRING(32),
        allowNull: false,
        unique: true,
    },
    status: {
        type: DataTypes.ENUM("ready","onLive","end","pause"),
        allowNull: false,
        defaultValue: 'ready',
    },
    duration:{
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    createTimeStamp:{
        type:DataTypes.INTEGER,
        defaultValue: moment.now(),
    },
    startTimeStamp:{
        type:DataTypes.INTEGER,
        defaultValue: 0,
    },
    endTimeStamp:{
        type:DataTypes.INTEGER,
        defaultValue: 0,
    },
    rtmpLink: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    originM3u8Link:{
        type: DataTypes.STRING(255),
      allowNull: false,
    },
    cdnM3u8Link:{
        type: DataTypes.STRING(255),
      allowNull: false,
    },
   
  },
  {
    indexes: [
        {
            fields: ['status'],
        },
    ],
    underscored: true,
    timestamps: true,
    paranoid: false,

    freezeTableName: true,
    tableName: 'livestreams',

    sequelize:sqlSequelize,
  }
);



export { livestreamModel };