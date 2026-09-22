const https = require('https');
const http = require('http');
const fs = require('fs');

https.get('https://www.cmds.cl', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const match = data.match(/<img[^>]+src=["']([^"']*(?:logo|cmds)[^"']*\.png)["']/i);
    if (match) {
      console.log('Found:', match[1]);
    } else {
      const allPngs = data.match(/<img[^>]+src=["']([^"']*\.(?:png|jpg|jpeg|svg|webp))["']/gi);
      console.log('All Images:', allPngs ? allPngs.slice(0, 10) : 'None');
    }
  });
}).on('error', console.error);
