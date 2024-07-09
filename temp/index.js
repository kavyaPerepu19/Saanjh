const express = require('express');
const https = require('https');
const cors = require('cors');
const natural = require('natural');
const tokenizer = new natural.WordTokenizer();

const app = express();
const port = 5000;

// Middleware to parse JSON bodies and enable CORS
app.use(express.json());
app.use(cors());

app.post('/query', (req, res) => {
    const data = JSON.stringify(req.body);
    console.log('Received request:', data);

    const options = {
        hostname: 'api-inference.huggingface.co',
        path: '/models/BioMistral/BioMistral-7B',
        method: 'POST',
        headers: {
            'Authorization': 'Bearer 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',
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    };

    const apiReq = https.request(options, (apiRes) => {
        let body = '';

        console.log(`Status Code: ${apiRes.statusCode}`);
        console.log('Headers:', apiRes.headers);

        apiRes.on('data', (chunk) => {
            body += chunk;
        });

        apiRes.on('end', () => {
            console.log('Raw API response:', body);
            if (apiRes.headers['content-type'] && apiRes.headers['content-type'].includes('application/json')) {
                try {
                    const result = JSON.parse(body);
                    res.json(result);
                } catch (error) {
                    console.error('Error parsing JSON:', error);
                    res.status(500).send('Internal Server Error: Failed to parse JSON');
                }
            } else {
                console.error('Non-JSON response received:', body);
                res.status(500).send(`Internal Server Error: Non-JSON response received: ${body}`);
            }
        });
    });

    apiReq.on('error', (error) => {
        console.error('Error querying the model:', error);
        res.status(500).send('Internal Server Error: Failed to query the model');
    });

    apiReq.write(data);
    apiReq.end();
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

