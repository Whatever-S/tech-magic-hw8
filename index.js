const http = require('http');
const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const readTemplateFile = (templatePath, dataPath) => {
    fs.readFile(templatePath, 'utf8', (err, template) => {
        if (err) {
            console.error(`Error reading template file: ${err.message}`);
            askForTemplatePath(dataPath);
            return;
        }

        readDataFile(template, dataPath);
    });
};

const readDataFile = (template, dataPath) => {
    fs.readFile(dataPath, 'utf8', (err, data) => {
        if (err) {
            console.error(`Error reading data file: ${err.message}`);
            askForDataPath(template);
            return;
        }

        let jsonData;
        try {
            jsonData = JSON.parse(data);
        } catch (err) {
            console.error(`Error parsing JSON data: ${err.message}`);
            askForDataPath(template);
            return;
        }

        const rendered = generateRenderedHTML(template, jsonData);

        http.createServer((req, res) => {
            if (req.url === '/style.css') {
                fs.readFile('./style.css', 'utf8', (err, css) => {
                    if (err) {
                        console.error(`Error reading CSS file: ${err.message}`);
                        res.writeHead(404, { 'Content-Type': 'text/plain' });
                        res.write('404 Not Found');
                        res.end();
                        return;
                    }
                    res.writeHead(200, { 'Content-Type': 'text/css' });
                    res.write(css);
                    res.end();
                });
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.write(rendered);
                res.end();
            }
        }).listen(3000, () => {
            console.log('Check the result on http://localhost:3000');
            rl.close();
        });
    });
};

const generateRenderedHTML = (template, jsonData) => {
    let rendered = template;
    let dataHTML = '';

    for (const key in jsonData) {
        const value = jsonData[key];
        let valueHTML = '';
        if (Array.isArray(value)) {
            valueHTML = '<ul>';
            value.forEach(item => {
                valueHTML += `<li>${item}</li>`;
            });
            valueHTML += '</ul>';
        } else {
            valueHTML = value;
        }
        dataHTML += `<p><strong>${key}:</strong> <span>${valueHTML}</span></p>`;
    }

    rendered = rendered.replace('{{data}}', `<div class="content">${dataHTML}</div>`);

    return rendered;
};

const askForTemplatePath = (dataPath) => {
    rl.question('Enter the correct path to the template file (recommend "index.html"): ', (templatePath) => {
        readTemplateFile(templatePath, dataPath);
    });
};

const askForDataPath = (template) => {
    rl.question('Enter the correct path to the data file (recommend "data.json"): ', (dataPath) => {
        readDataFile(template, dataPath);
    });
};

rl.question('Enter the path to the template file (recommend "index.html"): ', (templatePath) => {
    rl.question('Enter the path to the data file (recommend "data.json"): ', (dataPath) => {
        readTemplateFile(templatePath, dataPath);
    });
});
