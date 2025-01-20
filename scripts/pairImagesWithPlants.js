const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

async function pairImagesWithPlants() {
    const db = await open({
        filename: './converted_database.sqlite',
        driver: sqlite3.Database
    });

    const baseDir = path.join(__dirname, '../assets/bmp');

    const getDirectories = source =>
        fs.readdirSync(source, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);

    const getFiles = source =>
        fs.readdirSync(source, { withFileTypes: true })
            .filter(dirent => dirent.isFile())
            .map(dirent => dirent.name);

    const directories = getDirectories(baseDir);

    const plants = await db.all('SELECT * FROM BenchTags');
    const imagePlantPairs = [];

    for (const dir of directories) {
        const files = getFiles(path.join(baseDir, dir));
        for (const file of files) {
            const normalizedImageName = file.replace('.bmp', '').toLowerCase().replace(/[^a-z0-9]/g, '');
            const imagePath = path.join('assets/bmp', dir, file);

            const matchingPlant = plants.find(plant => {
                const tagName = plant.TagName ? plant.TagName.toLowerCase().replace(/[^a-z0-9]/g, '') : '';
                const botanicalName = plant.Botanical ? plant.Botanical.toLowerCase().replace(/[^a-z0-9]/g, '') : '';
                return tagName === normalizedImageName || botanicalName === normalizedImageName;
            });

            if (matchingPlant) {
                try {
                    await db.run('UPDATE BenchTags SET Image = ? WHERE ID = ?', [imagePath, matchingPlant.ID]);
                    console.log(`Updated image for plant: ${matchingPlant.TagName}`);
                    imagePlantPairs.push({ image: file, filePath: imagePath, plants: [matchingPlant.TagName] });
                } catch (error) {
                    console.error(`Error updating image for ${file}:`, error);
                }
            } else {
                console.log(`No matching plant found for image: ${file}`);
                imagePlantPairs.push({ image: file, filePath: imagePath, plants: [] });
            }
        }
    }

    // Save the pairs to a JSON file
    const outputFile = path.join(__dirname, '../imagePlantPairs.json');
    fs.writeFileSync(outputFile, JSON.stringify(imagePlantPairs, null, 2), 'utf8');
    console.log(`Pairs written to ${outputFile}`);

    await db.close();
}

pairImagesWithPlants().catch(err => {
    console.error('Error pairing images with plants:', err);
});