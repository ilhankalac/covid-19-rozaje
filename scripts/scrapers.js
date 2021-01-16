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
      
      for(let j = 0; j < splittedText.length; j++){

        let finalData = "Rožaje";

        for(let i = 0; i < 35; i++){
          finalData+= splittedText[j][i]
        }

        finalData = finalData.split("\n").filter(item => item != "" && item !="\t");
        console.log(finalData);
      }
        
      } catch (err) {
        console.error(err.message);
      } finally {
        await browser.close();
      }
}



scrapeData('https://www.ijzcg.me/me/novosti/covid19-presjek-stanja-09-januar-u-1730h');