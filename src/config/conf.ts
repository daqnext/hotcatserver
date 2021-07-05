//default to dev config
let config=require('./dev_config');

if(process.argv.includes("prod_config")){
    config=require('./prod_config');
}

export  {config};