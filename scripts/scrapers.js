const puppeteer = require('puppeteer-extra');
const pluginStealth = require('puppeteer-extra-plugin-stealth');
puppeteer.use(pluginStealth());

async function scrapeData(url){
   
const browser = await puppeteer.launch();   

    try {

      const page = await browser.newPage();
      await page.goto(url,{timeout: 0, waitUntil: 'networkidle0'});

      //SCRAPING ALL THE TEXT FROM THE PAGE
      const allText = await page.$eval('*', el => el.innerText); 

      //SPLITIING THE TEXT INTO ARRAY WITH STARTING WORD Rožaje
      let splittedText = allText.split("Rožaje");
      let arrayOfData = [];
      for(let j = 0; j < splittedText.length; j++){

        let finalData = "Rožaje";

        for(let i = 0; i < 31; i++){
          finalData+= splittedText[j][i]
        }

        finalData = finalData.split("\n").filter(item => item != "" && item !="\t");
        arrayOfData.push(finalData);


       
      }
      let i = 0;

      let currentData = arrayOfData[arrayOfData.length - 1];

      var myJson = JSON.stringify(currentData);

      var fs = require('fs');
      fs.readFile('readMe.txt', 'utf8', function (err, data) {
        fs.writeFile('currentData.json', myJson, function(err, result) {
          if(err) console.log('error', err);
        });
      });
     

  

      } catch (err) { 
        console.error(err.message);
      } finally {
        await browser.close();
      }
}



scrapeData('https://www.ijzcg.me/me/novosti/covid19-presjek-stanja-06-januar-u-1700h');