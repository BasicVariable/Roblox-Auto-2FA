# Roblox-Auto-2FA

Simple Auto 2FA for roblox trades.

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
