//default to dev config
let config=require('./dev_config');

console.info(process.argv)
if(process.argv.includes("prod_config")){
    config=require('./prod_config');
    console.info("running prod mode")
}else{
    console.info("running dev mode")
}

export  {config};