const router = require("express").Router();
const asyncHandler = require("express-async-handler");
const axiosLib = require("axios");
const fs = require("fs");
const auth = require("../auth");

router.get("/",
    auth.optional,
    asyncHandler(async (req, res) => {
        const baseURL = 'https://wilco-engine.herokuapp.com';

        const axios = axiosLib.create({
            baseURL: baseURL,
            headers: {
                'Content-type': 'application/json',
            },
        });

        try {
            const wilcoId = fs.readFileSync('../.wilco', 'utf8')

            const result = await axios.post(`/users/${wilcoId}/event`, JSON.stringify({ event: 'ping' }));

            return res.json(result.data);
        } catch (e) {
            console.error(e)
            return res.sendStatus(500);
        }
    }));

module.exports = router;
