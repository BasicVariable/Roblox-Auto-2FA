const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

var currentCSRF;

const checkAccount = async (cookie) => {
    let trys = 0; while (trys < 3){
        let response = await fetch("https://users.roblox.com/v1/users/authenticated", {
            method: "GET",
            headers: {'Content-Type': 'application/json',"cookie": ".ROBLOSECURITY="+cookie}
        }).catch(err => console.log(err));

        if (!response || response.status!=200) {
            trys++;
            continue
        };
    
        try{
            return (await response.json())
        }catch(err){
            console.log(`Failed to check cookie ${cookie.split(/_/g, 2)[2]}:`, err);
            await reactiveDelay(5_000);
            trys++
        }
    }
};

const getConfig = async (cookie, uid) => {
    let trys = 0; while (trys < 2){
        let response = await fetch(`https://twostepverification.roblox.com/v1/users/${uid}/configuration`, {
            method: "GET",
            headers: {'Content-Type': 'application/json',"cookie": ".ROBLOSECURITY="+cookie}
        }).catch(err => console.log(err));

        if (!response || response.status!=200) {
            trys++;
            continue
        };

        try{
            return (await response.json()).methods
        }catch(err){
            console.log(`Failed to get configuration:`, err);
            await reactiveDelay(5_000);
            trys++
        }
    }
};

const getCsrfToken = async (cookie) => {
    if (currentCSRF) return currentCSRF;
    while (true){
        let response = await fetch("https://auth.roblox.com/v1/xbox/disconnect", {
            method: "POST",
            headers: {'content-type': 'application/json;charset=UTF-8',"cookie": ".ROBLOSECURITY="+cookie}
        }).catch((err) => {});

        if (!response || response.status!= 403) continue;

        let token = await response.headers.get("x-csrf-token");
        if (!token) {await reactiveDelay(10_000); continue};

        currentCSRF = token;
        return token
    }
};

const startChallenge = async (cookie) => {
    let trys = 0; while (trys < 3){
        let response = await fetch(`https://trades.roblox.com/v1/trade-friction/two-step-verification/generate`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                "cookie": ".ROBLOSECURITY="+cookie,
                "x-csrf-token": await getCsrfToken(cookie)
            }
        }).catch(err => console.log(err));

        if (!response || response.status!=200) {
            if (response && response.status == (401 || 403)) currentCSRF = null;
            trys++;
            continue
        };

        try{
            return (await response.text()).replace(/"/g, "")
        }catch(err){
            console.log(`Failed to get challenge ID:`, err);
            await reactiveDelay(5_000);
            trys++
        }
    }
};

const getRedeemtionCode = async (challengeId, cookie, uid, code) => {
    let trys = 0; while (trys < 3){
        let response = await fetch(`https://twostepverification.roblox.com/v1/users/${uid}/challenges/authenticator/verify`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                "cookie": ".ROBLOSECURITY="+cookie,
                "x-csrf-token": await getCsrfToken(cookie)
            },
            body: JSON.stringify({
                "challengeId": challengeId,
                "actionType":"ItemTrade",
                "code": code.toString()
            })
        }).catch(err => console.log(err));

        if (!response || response.status!=200) {
            if (response && response.status == (401 || 403)) currentCSRF = null;
            trys++;
            continue
        };

        try{
            return (await response.json()).verificationToken
        }catch(err){
            console.log(`Failed to get challenge token:`, err);
            await reactiveDelay(5_000);
            trys++
        }
    }
};

const complete2FA = async (account, getCode) => {
    let challengeId = await startChallenge(account.cookie);
    if (!challengeId) return;

    let tempCode = await getCode(account.token);
    if (!tempCode) return;

    let redeemtionCode = await getRedeemtionCode(challengeId, account.cookie, account.id, tempCode);
    if (!redeemtionCode) return; 

    let trys = 0; while (trys < 3){
        let response = await fetch(`https://trades.roblox.com/v1/trade-friction/two-step-verification/redeem`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                "cookie": ".ROBLOSECURITY="+account.cookie,
                "x-csrf-token": await getCsrfToken(account.cookie)
            },
            body: JSON.stringify({
                "challengeToken": challengeId,
                "verificationToken": redeemtionCode
            })
        }).catch(err => console.log(err));

        if (!response || response.status!=200) {
            if (response && response.status == 403) currentCSRF = null;
            trys++;
            continue
        };

        try{
            return (await response.text())
        }catch(err){
            console.log(`Failed to claim challenge token:`, err);
            await reactiveDelay(5_000);
            trys++
        }
    }
};

module.exports = {checkAccount, getConfig, complete2FA}
