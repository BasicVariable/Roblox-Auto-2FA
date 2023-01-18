# Roblox-Auto-2FA

Simple Auto 2FA for roblox trades.

# Installation
```
1. Download all the files in this repository through the code button and by clicking "download zip"
2. Extract the zip and open the folder the files are in
  2a. Setup config.yml with your accounts and prefered settings
3. Open command prompt with the folder that contains all the files as the directory
4. Type 'npm install' and press enter
5. Type 'node index.js' and press enter
```

# Getting 2FA token
```
1. Go to your security settings on Roblox (https://www.roblox.com/my/account#!/security)
2. Disable "Authenticator App (Very Secure)"
3. Re-enable "Authenticator App (Very Secure)" and click "Can't scan the QR code? Click here for manual entry."
4. Copy the token that appears on your screen and enter it in the config

Follow if you didn't finish the "Authenticator Setup" for Roblox by using an authenticator app.
  4a. Once you start the 2FA bot you'll get a prompt if you didn't complete the "Authenticator Setup" for roblox
  4b. Copy and paste the code it gives you in Roblox's "Authenticator Setup"
```

# Documentation 

refreshInterval:
Amount of hours before it completes another 2fa challenge.

accounts:
A list of accounts (as objects) that will have their 2fa challenges completed.
```
accounts: 
  - {token: "", cookie: ""}
  - {token: "", cookie: ""}
```
