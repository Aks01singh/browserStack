const { Builder, By, until, Capabilities } = require("selenium-webdriver");
const fs = require("fs");
const https = require("https");

describe("El Pais scraping test", () => {
  let driver;

  beforeAll(() => {
    driver = new Builder()
      .usingServer(`http://localhost:4444/wd/hub`)
      .withCapabilities(Capabilities.chrome())
      .build();
  });

  afterAll(async () => {
    await driver.quit();
  });

  test(
    "Scrape El Pais Opinion Section",
    async () => {
      try {
        // Navigate to El País
        await driver.get("https://elpais.com");
        console.log("Page Title:", await driver.getTitle());

        // Handle cookie pop-up
        try {
          const cookiePopupButton = await driver.wait(
            until.elementLocated(By.id("didomi-notice-agree-button")),
            20000
          );
          await cookiePopupButton.click();
        } catch (error) {
          console.log("No cookie pop-up detected.");
        }

        // Navigate to the "Opinión" section
        const opinionLink = await driver.findElement(By.linkText("Opinión"));
        await opinionLink.click();
        await driver.wait(until.titleContains("Opinión"), 10000);

        const titles = [];
        const articles = await driver.findElements(By.css("article h2"));

        for (let i = 0; i < Math.min(5, articles.length); i++) {
          const article = articles[i];
          const title = await article.getText();
          titles.push(title);

          // Navigate to the article
          const articleLink = await article.findElement(By.css("a"));
          await articleLink.click();

          // Scrape the article content
          const contentDiv = await driver.wait(
            until.elementLocated(By.xpath('//div[@class="a_c clearfix"]')),
            20000
          );

          const paragraphs = await contentDiv.findElements(By.css("p"));
          for (const paragraph of paragraphs) {
            console.log(await paragraph.getText());
          }

          // Download article image
          try {
            const imageElement = await driver.findElement(By.css("figure img"));
            const imageUrl = await imageElement.getAttribute("src");
            await downloadImageWithHttps(imageUrl, title);
          } catch (error) {
            console.log("Image URL error:", error);
          }

          // Go back to the Opinion section
          await driver.navigate().back();
        }

        console.log("Scraped Titles:", titles);
      } catch (error) {
        console.error("An error occurred:", error);
      }
    },
    100000 // Timeout for the test
  );
});

// Download image using Node.js `https` module
function downloadImageWithHttps(imageUrl, title) {
  return new Promise((resolve, reject) => {
    https.get(imageUrl, (response) => {
      if (response.statusCode !== 200) {
        console.error(`Failed to get image: ${response.statusCode}`);
        reject();
        return;
      }
      const filename = `${title.slice(0, 10).replace(/\s/g, "_")}.jpg`;
      const file = fs.createWriteStream(filename);
      response.pipe(file);
      file.on("finish", () => {
        file.close(resolve);
      });
      file.on("error", (err) => {
        fs.unlink(filename, () => reject(err));
      });
    });
  });
}
