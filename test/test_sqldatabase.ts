import { assert } from "chai";
import {SqlTool} from '../src/db/SqlTool'
import {logger} from '../src/global'

describe('database tests', function() {

              it('connect db result',  async ()=> {            
                let result:Boolean= await SqlTool.getSingleInstance().auth();
                assert.equal(result,true); 
              });
  });
