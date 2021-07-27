import { assert } from "chai";
import {SqlTool} from '../src/db/SqlTool'
import {testModel} from '../src/model/testModel';
import {logger} from '../src/global'

describe('database tests', function() {

              it('connect db result',  async ()=> {            
                let result:Boolean= await SqlTool.getSingleInstance().auth();
                assert.equal(result,true); 
              });

              ////////////////////////////////////////////////
              it('create sql test table  ',  async ()=> {  
                const testModel = require('../src/model/testModel');
                await SqlTool.getSingleInstance().sequelize.sync({force:false});
                assert.isOk("create success");
              });

              ////////////////////////////////////////////////
              it('insert data into test table  ',  async ()=> {  
                 let [result,vacant]=await testModel.findOrBuild({  where :{name:'test','favoriteColor':'white' }});
                 if(vacant){
                      await result.save();
                      logger.info('insert success');
                      assert.isOk(true);
                 }else{
                      logger.info('insert overlap detected');
                      assert.isOk(true);
                 }
                 
              });

  });
