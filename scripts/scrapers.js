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
      let rozajeFinderArray = allText.split("Rožaje");
      let dateOfPublishing = allText.split("Objavljeno:")[1].substring(0, 13);

      let arrayOfData = [];
      for(let j = 0; j < rozajeFinderArray.length; j++){

        let finalData = "Rožaje";

        for(let i = 0; i < 31; i++){
          finalData+= rozajeFinderArray[j][i]
        }

        finalData = finalData.split("\n").filter(item => item != "" && item !="\t");
        arrayOfData.push(finalData);
       
      }

      let currentData = arrayOfData[arrayOfData.length - 1];

      let objectData = {
                        "Datum": dateOfPublishing.toString().trim(), 
                        "Grad": currentData[0], 
                        "Aktivni": currentData[1], 
                        "Oporavljeni": currentData[2],
                        "Umrli": currentData[3]
                      };


      var myJson = JSON.stringify(objectData);

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



scrapeData('https://www.ijzcg.me/me/novosti/covid19-presjek-stanja-17-januar-u-1730h');