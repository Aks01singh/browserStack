import { Builder, By, until } from "selenium-webdriver";
import axios from 'axios';
import * as fs from 'fs';

async function scrapeElPais() {
  // Set up the WebDriver
  const driver = await new Builder().forBrowser("chrome").build();
  await driver.manage().window().maximize();

  try {
    // Navigate to El País
    await driver.get("https://elpais.com");

    // Wait for the page to load
    await driver.wait(until.titleContains("EL PAÍS"), 10000);

    console.log("Page Title:", await driver.getTitle());

    //check if cookie popup is present or not
    try {
      const cookiePopupButton = await driver.wait(until.elementLocated(By.id("didomi-notice-agree-button")), 20000);
      await cookiePopupButton.click();
    } catch (error) {
      console.log("No cookie pop-up detected.");
    }

    // Click on the "Opinión" section
    const opinionLink = await driver.findElement(By.linkText("Opinión"));
    await opinionLink.click();

    // Wait for the Opinion page to load
    await driver.wait(until.titleContains("Opinión"), 10000);

    console.log("Current Page Title:", await driver.getTitle());

    const titles: string[] = [];
    // Scrape article titles
    const articles = await driver.findElements(By.css("article h2"));
    for (let i=0;i<5;i++) {
      let article=articles[i];
      const title = await article.getText();
      titles.push(title);

      const articleLink = await article.findElement(By.css('a'));
      await articleLink.click();

      const contentDiv = await driver.wait(
        until.elementLocated(By.xpath('//div[@class="a_c clearfix"]')), // Locate the parent div
        20000 // Wait up to 20 seconds
      );

      const paragraphs = await contentDiv.findElements(By.css("p"));

      // Loop through the paragraphs and extract their text
      for (const paragraph of paragraphs) {
        const text = await paragraph.getText();
        console.log( text);
      }

      try {
        const imageElement = await driver.findElement(By.css('figure img'));
        const imageUrl = await imageElement.getAttribute('src');
        await downloadImage(imageUrl, title);
      } catch(error) {
        console.log('image url error: ',error);
      }

      // Go back to the Opinion section
      await driver.navigate().back();

      // Translate titles
      const translatedTitles = await Promise.all(
        titles.map(title => translateWithMyMemory(title, 'es', 'en'))
      );

      // Print original and translated titles
      console.log('Original Titles:', titles);
      console.log('Translated Titles:', translatedTitles);

      // Analyze repeated words
      await analyzeRepeatedWords(translatedTitles);
    }
  } catch (error) {
    console.error("An error occurred:", error);
  } finally {
    // Close the browser
    await driver.quit();
  }

}

async function downloadImage(imageUrl: string, title: string) {
  const response = await axios.get(imageUrl, { responseType: 'stream' });
  const filename = `${title.slice(0, 10).replace(/\s/g, '_')}.jpg`;
  const writer = fs.createWriteStream(filename);

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

async function translateWithMyMemory (text: string, sourceLang: string, targetLang: string) {
  const url = `https://api.mymemory.translated.net/get`;

  try {
      const response = await axios.get(url, {
          params: {
              q: text,
              langpair: `${sourceLang}|${targetLang}`
          },
      });
      console.log("Translation:", response.data.responseData.translatedText);
      return response.data.responseData.translatedText;
  } catch (error) {
      console.error("Error:", error);
  }
};

async function analyzeRepeatedWords(titles: any) {
  const allWords = titles.join(' ').toLowerCase().match(/\w+/g) || [];
  const wordCount: { [key: string]: number } = {};

  for (const word of allWords) {
    wordCount[word] = (wordCount[word] || 0) + 1;
  }

  const repeatedWords = Object.entries(wordCount).filter(([_, count]) => count > 2);
  console.log('Repeated Words:', repeatedWords);
}

scrapeElPais();



