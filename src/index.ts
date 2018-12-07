import * as cheerio from 'cheerio';

import * as fs from 'fs-extra';

import * as commander from 'commander';

import * as csvStringify from 'csv-stringify';

const ToCSV = (obj: any) =>
  new Promise((resolve, reject) => {
    csvStringify(obj, (err, output) => {
      if (err) {
        return reject(err);
      }
      resolve(output);
    });
  });

const contents = (element: CheerioElement) =>
  element.childNodes.length > 0 && element.childNodes[0].type === 'text'
    ? element.childNodes[0].data.trim()
    : '';

async function convertToCsv(crimetable: string, outputFile: string) {
  const data = [];

  const html = await fs.readFile(crimetable, 'utf8');
  const $ = cheerio.load(html);

  $('tr').each((index, element) => {
    const line = [];
    element.childNodes
      .filter((value) => value.name === 'td')
      .filter((el) => contents(el).length > 0)
      .forEach((child, idx) => line.push(contents(child)));
    data.push(line);
  });
  await fs.writeFile(outputFile, await ToCSV(data));
}

commander
  .version('0.1.0')
  .usage('[options] <file>')
  .arguments('<file>')
  .option('-o, --output [output]', 'Output file', 'output.csv')
  .action(async (file) => {
    console.log(`Converting ${file} to ${commander['output']}`);
    convertToCsv(file, commander['output']);
  })
  .parse(process.argv);
