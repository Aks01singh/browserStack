import { Builder, By, until } from "selenium-webdriver";
import axios from "axios";
import * as browserstack from "browserstack-local";
import * as fs from "fs";

const username = "ashishkumarsingh_tn2gbA"; // Replace with your BrowserStack username
const accessKey = "gVzz4TSbpWupyxZtdT9P"; // Replace with your BrowserStack access key

const browserStackConfig = [
  {
    os: "Windows",
    os_version: "10",
    browser: "Chrome",
    browser_version: "latest",
  },
  {
    os: "OS X",
    os_version: "Monterey",
    browser: "Safari",
    browser_version: "latest",
  },
  {
    device: "iPhone 14",
    os_version: "16",
    real_mobile: "true",
    browser: "Safari",
  },
  {
    device: "Samsung Galaxy S22",
    os_version: "12.0",
    real_mobile: "true",
    browser: "Chrome",
  },
  {
    os: "Linux",
    browser: "Firefox",
    browser_version: "latest",
  },
];

async function scrapeElPais(driver: any) {
  try {
    await driver.manage().setTimeouts({ pageLoad: 60000 }); // Increase page load timeout

    await driver.get("https://elpais.com");
    console.log("Page Title:", await driver.getTitle());

    try {
      const cookiePopupButton = await driver.wait(
        until.elementLocated(By.id("didomi-notice-agree-button")),
        20000
      );
      await cookiePopupButton.click();
    } catch (error) {
      console.log("No cookie pop-up detected.");
    }

    const opinionLink = await driver.findElement(By.linkText("Opinión"));
    await opinionLink.click();
    await driver.wait(until.titleContains("Opinión"), 10000);

    const titles: string[] = [];
    const articles = await driver.findElements(By.css("article h2"));

    for (let i = 0; i < Math.min(5, articles.length); i++) {
      const article = articles[i];
      const title = await article.getText();
      titles.push(title);

      const articleLink = await article.findElement(By.css("a"));
      await articleLink.click();

      const contentDiv = await driver.wait(
        until.elementLocated(By.xpath('//div[@class="a_c clearfix"]')),
        20000
      );

      const paragraphs = await contentDiv.findElements(By.css("p"));
      for (const paragraph of paragraphs) {
        console.log(await paragraph.getText());
      }

      await driver.navigate().back();
    }

    console.log("Scraped Titles:", titles);
  } catch (error) {
    console.error("An error occurred:", error);
  } finally {
    await driver.quit();
  }
}

(async function runTestsInParallel() {
  const bsLocal = new browserstack.Local();
  bsLocal.start({ key: accessKey }, async (error: any) => {
    if (error) {
      console.error("Failed to start BrowserStack Local:", error);
      return;
    }

    console.log("BrowserStack Local started successfully!");

    const promises = browserStackConfig.map(async (capability: any) => {
      const driver = new Builder()
        .usingServer(`https://${username}:${accessKey}@hub-cloud.browserstack.com/wd/hub`)
        .withCapabilities({
          ...capability,
          "bstack:options": {
            idleTimeout: 300, // Set to 300 seconds
            os: capability.os,
            osVersion: capability.os_version,
            local: true,
            seleniumVersion: "4.1.2"
          },
          browserName: capability.browser,
          browserVersion: capability.browser_version || "latest",
        })
        .build();

      try {
        await scrapeElPais(driver);
      } catch (err) {
        console.error("Test failed for capability:", capability, err);
      } finally {
        await driver.quit();
      }
    });

    await Promise.all(promises);

    bsLocal.stop(() => {
      console.log("BrowserStack Local stopped.");
    });
  });
})();
