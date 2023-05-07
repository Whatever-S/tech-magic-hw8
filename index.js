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

    const skillsList = jsonData.skills.map(skill => `<li class='skill-item'>${skill}</li>`).join('');

    const rendered = template
        .replace(/{{(\w+)}}/g, (match, p1) => {
            return jsonData[p1] || '';
        })
        .replace('{{skills}}', skillsList);

    http.createServer((req, res) => {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(rendered);
        res.end();
    }).listen(3000, () => {
        console.log('Check the result on http://localhost:3000');
        rl.close();
    });
    });
};

const askForTemplatePath = (dataPath) => {
    rl.question('Enter the correct path to the template file: ', templatePath => {
        readTemplateFile(templatePath, dataPath);
    });
};

const askForDataPath = (template) => {
    rl.question('Enter the correct path to the data file: ', dataPath => {
        readDataFile(template, dataPath);
    });
};

rl.question('Enter the path to the template file: ', templatePath => {
    rl.question('Enter the path to the data file: ', dataPath => {
        readTemplateFile(templatePath, dataPath);
    });
});
