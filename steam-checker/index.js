const express = require("express");
const SteamUser = require("steam-user");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/check", (req, res) => {
    const { username, password, twoFactorCode } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: "username and password required" });
    }

    let client = new SteamUser();
    let responded = false;

    client.logOn({
        accountName: username,
        password: password,
        twoFactorCode: twoFactorCode || undefined
    });

    // ✅ Successful login
    client.on("loggedOn", () => {
        if (!responded) {
            responded = true;
            console.log(`[OK] ${username} logged in successfully`);
            client.logOff();
            res.json({ valid: true });
        }
    });

    // ❌ Password wrong, account banned, etc.
    client.on("error", (err) => {
        if (!responded) {
            responded = true;
            console.log(`[FAIL] ${username} login failed: ${err.message}`);
            res.json({ valid: false, error: err.message });
        }
    });

    // ⚠️ Steam Guard required (email or mobile)
    client.on("steamGuard", (domain, callback, lastCodeWrong) => {
        if (!responded) {
            responded = true;
            console.log(`[GUARD] ${username} requires Steam Guard (${domain || "mobile"})`);
            res.json({ valid: false, error: "SteamGuardRequired" });
        }
    });
});

const PORT = 4000;
app.listen(PORT, () => {
    console.log(`Steam Checker service running on port ${PORT}`);
});
