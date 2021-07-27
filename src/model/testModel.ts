import {SqlTool} from '../db/SqlTool';
import {DataTypes } from 'sequelize';

const testModel = SqlTool.getSingleInstance().sequelize.define("test", {
  name: {
    type:DataTypes.STRING(128),
    unique:true
  },
  favoriteColor: {
    allowNull: false,
    type: DataTypes.TEXT
  },
  age: DataTypes.INTEGER,
  cash: DataTypes.INTEGER,

});

const   testModel_createData = async function () {
  await testModel.findOrCreate({  where :{name:'jane','favoriteColor':'white' }});
  await testModel.findOrCreate({  where :{name:'bill','favoriteColor':'blue' }});
  await testModel.findOrCreate({  where :{name:'jack','favoriteColor':'green' }});
}

export{testModel,testModel_createData}