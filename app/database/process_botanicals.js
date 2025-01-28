import fs from 'fs';
// File paths
const inputFile = './botanicals.json'; // Path to your input JSON file
const outputFile = './processedBotanicals.json'; // Path to save processed data

// Main function to read, process, and save data
function processBotanicals() {
  try {
    // Read the input file
    const data = fs.readFileSync(inputFile, 'utf-8');
    const botanicals = JSON.parse(data);

    // Process the data (if needed, add transformations or checks here)
    const processedData = botanicals.map(item => ({
      id: item.id,
      botanical: item.botanical.trim(),
      common: item.common.trim(),
    }));

    // Save the processed data to a new JSON file
    fs.writeFileSync(outputFile, JSON.stringify(processedData, null, 2));
    console.log(`Processed data saved to ${outputFile}`);
  } catch (error) {
    console.error('Error processing botanicals:', error.message);
  }
}

// Run the script
processBotanicals();
