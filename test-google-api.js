const https = require('https');

const API_KEY = 'AIzaSyDIytyd4QxFznl_5FEScowlSxERkIVtyNg';
const CX = '45f437d33e9d84d6e';
const query = 'Docker logo transparent png';

const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&cx=${CX}&key=${API_KEY}&searchType=image&num=1`;

console.log('Testing URL:', url);

https.get(url, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (json.error) {
                console.error('API Error:', JSON.stringify(json.error, null, 2));
            } else if (json.items && json.items.length > 0) {
                console.log('Success! Found image:', json.items[0].link);
            } else {
                console.log('No items found (Status 200). Logic: searchType=image might be restricted by CX settings?');
                console.log('Full Response:', JSON.stringify(json, null, 2));
            }
        } catch (e) {
            console.error('Parse Error:', e);
            console.log('Raw Data:', data);
        }
    });

}).on('error', (err) => {
    console.error('Network Error:', err);
});
