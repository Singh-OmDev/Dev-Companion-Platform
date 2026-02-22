const pdf = require('pdf-parse');
const fs = require('fs');

async function test() {
    try {
        console.log("Creating dummy pdf...");
        fs.writeFileSync('dummy.pdf', 'This is a test pdf file.');
        const dataBuffer = fs.readFileSync('dummy.pdf');
        console.log("Parsing...");
        const data = await pdf(dataBuffer);
        console.log("Success:", data.text);
    } catch (e) {
        console.error("Parse Error:", e);
    }
}
test();
