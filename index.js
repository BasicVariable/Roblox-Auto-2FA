const fs = require("node:fs");
const readline = require('node:readline/promises');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const yaml = require("js-yaml");
const twofactor = require("node-2fa");

var config;
var accounts = [];

// --- 
const rbxApi = require("./subFiles/rblxLib.js");
// ---

global.reactiveDelay = (ms, reaction) => new Promise(res => {
    setTimeout(async () => {
        if (typeof reaction == "function") res(await reaction());
        res()
    }, ms)
});

const verifyST = async (securityToken) => {
    const token = twofactor.generateToken(securityToken);
    if (!token || !"token" in token) return;

    const deltaCode = twofactor.verifyToken(securityToken, token.token, 30);
    if (!deltaCode || !"delta" in deltaCode) return;

    return (deltaCode.delta != 0)?
        twofactor.generateToken(securityToken)
        :
        token.token
};

fs.readFile("./config.yml", 'utf-8', async (err, res) => {
    if (err) {
        console.log("Failed to read config.yml", err);
        await reactiveDelay(20_000, process.exit)
    };
    
    try{
        config = yaml.load(res)
    }catch(err){
        console.log("Failed to parse yaml", err);
        await reactiveDelay(20_000, process.exit)
    };

    for (account of config.accounts){
        let newToken = await verifyST(account.token);
        if (!newToken){
            console.log("Your security token is invalid:", account.token);
            continue
        };

        let accountInfo = await rbxApi.checkAccount(account.cookie);
        if (!accountInfo) {
            console.log("Your cookie is invalid:", account.cookie);
            continue
        };
        
        while (true){
            let accountConfig = await rbxApi.getConfig(account.cookie, accountInfo.id) || [];
            let authenticatorEnabled = accountConfig.filter(f2aMethod => f2aMethod.mediaType === "Authenticator" && f2aMethod.enabled == true);

            if (authenticatorEnabled.length < 1){
                console.log(`Your token isn't attached to this account (${accountInfo.name}):`);
                await rl.question(`Press enter once you've entered in the code "${newToken}" on the "Authenticator Setup" or do ctrl + c to exit the program`);
                continue
            };

            break
        };

        accounts.push({
            cookie: account.cookie,
            token: account.token,
            id: accountInfo.id,
            name: accountInfo.name
        })
    };

    if (accounts.length < 1) {
        console.log("No valid accounts...");
        await reactiveDelay(20_000, process.exit)
    };

    let accounts2Names = accounts.reduce((a, current, index) => {
        return a += `${current.name}${(index<accounts.length-1)?",":""}`
    }, "");
    console.log(`Verified ${accounts2Names}.\nStarting 2fa verifications...`);

    // Readline for status updates (IM NOT USING SWITCH CASES THERE WILL BE NO MORE COMMANDS IM SURE)
    rl.on('line', async (input) => {
        if (input.toLowerCase() === "newcodes"){
            let accountCodes = await accounts.reduce(async (a, current) => {
                const newCode = await verifyST(account.token);
                return a+=`\n${current.name}: ${newCode}`
            }, "New Codes:");
            console.log(accountCodes);
        }
    });

    while (true){
        for (account of accounts){
            let verificationProcess = await rbxApi.complete2FA(account, verifyST);
            if (!verificationProcess) {
                let accountindex = accounts.indexOf(account);
                accounts.splice(accountindex);
                console.log(`Failed to refresh 2fa status for ${account.name} / ${account.id} / ${account.token}`, "Removing from account pool");
                continue
            };

            console.log(`${(new Date()).toLocaleString('en-US')} > Refreshed 2fa status for ${account.name} / ${account.id} / ${account.token}`, 
                `   > Your 2Step code is ${await verifyST(account.token)}`
            );
        };
        
        if (accounts.length < 1) {
            console.log("No more accounts in account pool");
            await reactiveDelay(120_000, process.exit)
        };
        await reactiveDelay((config.refreshInterval*3.6e+6))
    }
})