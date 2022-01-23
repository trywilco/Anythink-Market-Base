const router = require("express").Router();
const asyncHandler = require("express-async-handler");
const axiosLib = require("axios");
const fs = require("fs");
const auth = require("../auth");

router.get("/",
    auth.optional,
    asyncHandler(async (req, res) => {
        const isProduction = process.env.NODE_ENV === "production";
        const baseURL = isProduction ? 'https://wilco-engine.herokuapp.com' : 'https://wilco-engine-staging.herokuapp.com/';
        const axios = axiosLib.create({
            baseURL: `${baseURL}/api/v1`,
            headers: {
                'Content-type': 'application/json',
            },
        });

        try {
            const wilcoId = fs.readFileSync('../../.wilco', 'utf8')

            const result = await axios.get(`/ping/${wilcoId}`);

            return res.json(result.data);
        } catch (e) {
            console.error(e)
            return res.sendStatus(500);
        }
    }));

module.exports = router;
