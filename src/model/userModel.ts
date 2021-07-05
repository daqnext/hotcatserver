import {SqlTool} from '../db/SqlTool';
import {DataTypes } from 'sequelize';
import {userManager} from '../manager/userManager'

const userModel = SqlTool.getSingleInstance().sequelize.define("user", {
  cookie:{
    type:DataTypes.STRING(32),
    unique:true
  },
  name: {
    type:DataTypes.STRING(32),
    unique:true
  },
  email:{
    type:DataTypes.STRING(64),
    unique:true
  },
  password:{
    type:DataTypes.STRING(64),
  },
  permission:{
    type:DataTypes.TEXT
  }
});

const   userModel_createData = async function () {
  await userModel.findOrCreate({  where :{cookie:userManager.genCookie(),name:'admin',email:'admin@meson.com',password:userManager.genMd5password('abc123'),permission:JSON.stringify(['admin',]) }});
  await userModel.findOrCreate({  where :{cookie:userManager.genCookie(),name:'jack', email:'jack@gmail.com' ,password:userManager.genMd5password('abc123'),permission:JSON.stringify([]) }});
  await userModel.findOrCreate({  where :{cookie:userManager.genCookie(),name:'leo',  email:'leo@gmail.com'  ,password:userManager.genMd5password('abc123'),permission:JSON.stringify([]) }});
}

export{userModel,userModel_createData}