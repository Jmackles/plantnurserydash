const fs = require('fs');
const path = require('path');

const imageNames = fs.readFileSync(path.join(__dirname, '../imageNames.txt'), 'utf8').split('\n').map(name => name.trim());
const plantNames = fs.readFileSync(path.join(__dirname, '../plantNames.txt'), 'utf8').split('\n').map(name => name.trim());

const imagePlantMap = {};
imageNames.forEach((imageName, index) => {
    const plantName = plantNames[index];
    if (plantName) {
        imagePlantMap[imageName] = plantName;
    }
});

const pairs = JSON.parse(fs.readFileSync(path.join(__dirname, '../imagePlantPairs.json'), 'utf8'));

const updatedPairs = pairs.map(pair => {
    const plantName = imagePlantMap[pair.image];
    return {
        image: pair.image,
        plants: plantName ? [plantName] : []
    };
});

const outputFile = path.join(__dirname, '../imagePlantPairs.json');
fs.writeFileSync(outputFile, JSON.stringify(updatedPairs, null, 2), 'utf8');

console.log(`Pairs written to ${outputFile}`);
