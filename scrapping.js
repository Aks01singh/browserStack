"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var selenium_webdriver_1 = require("selenium-webdriver");
var axios_1 = require("axios");
var fs = require("fs");
function scrapeElPais() {
    return __awaiter(this, void 0, void 0, function () {
        var driver, title, opinionLink, articles, titles, contents, imageUrls, _i, articles_1, article, title_1, articleLink, content, imageElement, imageUrl, _a, translatedTitles, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, new selenium_webdriver_1.Builder().forBrowser('chrome').build()];
                case 1:
                    driver = _b.sent();
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 23, 24, 26]);
                    // Navigate to El País
                    return [4 /*yield*/, driver.get('https://elpais.com')];
                case 3:
                    // Navigate to El País
                    _b.sent();
                    return [4 /*yield*/, driver.getTitle()];
                case 4:
                    title = _b.sent();
                    return [4 /*yield*/, driver.findElement(selenium_webdriver_1.By.linkText('Opinión'))];
                case 5:
                    opinionLink = _b.sent();
                    return [4 /*yield*/, opinionLink.click()];
                case 6:
                    _b.sent();
                    return [4 /*yield*/, driver.findElements(selenium_webdriver_1.By.css('article')).slice(0, 5)];
                case 7:
                    articles = _b.sent();
                    titles = [];
                    contents = [];
                    imageUrls = [];
                    _i = 0, articles_1 = articles;
                    _b.label = 8;
                case 8:
                    if (!(_i < articles_1.length)) return [3 /*break*/, 21];
                    article = articles_1[_i];
                    return [4 /*yield*/, article.findElement(selenium_webdriver_1.By.css('h2')).getText()];
                case 9:
                    title_1 = _b.sent();
                    titles.push(title_1);
                    return [4 /*yield*/, article.findElement(selenium_webdriver_1.By.tagName('a'))];
                case 10:
                    articleLink = _b.sent();
                    return [4 /*yield*/, articleLink.click()];
                case 11:
                    _b.sent();
                    return [4 /*yield*/, driver.findElement(selenium_webdriver_1.By.css('div.article_body')).getText()];
                case 12:
                    content = _b.sent();
                    contents.push(content);
                    _b.label = 13;
                case 13:
                    _b.trys.push([13, 17, , 18]);
                    return [4 /*yield*/, driver.findElement(selenium_webdriver_1.By.css('figure img'))];
                case 14:
                    imageElement = _b.sent();
                    return [4 /*yield*/, imageElement.getAttribute('src')];
                case 15:
                    imageUrl = _b.sent();
                    imageUrls.push(imageUrl);
                    return [4 /*yield*/, downloadImage(imageUrl, title_1)];
                case 16:
                    _b.sent();
                    return [3 /*break*/, 18];
                case 17:
                    _a = _b.sent();
                    imageUrls.push();
                    return [3 /*break*/, 18];
                case 18: 
                // Go back to the Opinion section
                return [4 /*yield*/, driver.navigate().back()];
                case 19:
                    // Go back to the Opinion section
                    _b.sent();
                    _b.label = 20;
                case 20:
                    _i++;
                    return [3 /*break*/, 8];
                case 21: return [4 /*yield*/, Promise.all(titles.map(function (title) { return translateText(title, 'es', 'en'); }))];
                case 22:
                    translatedTitles = _b.sent();
                    // Print original and translated titles
                    console.log('Original Titles:', titles);
                    console.log('Translated Titles:', translatedTitles);
                    // Analyze repeated words
                    analyzeRepeatedWords(translatedTitles);
                    return [3 /*break*/, 26];
                case 23:
                    error_1 = _b.sent();
                    console.error('An error occurred:', error_1);
                    return [3 /*break*/, 26];
                case 24: 
                // Close the driver
                return [4 /*yield*/, driver.quit()];
                case 25:
                    // Close the driver
                    _b.sent();
                    return [7 /*endfinally*/];
                case 26: return [2 /*return*/];
            }
        });
    });
}
function downloadImage(imageUrl, title) {
    return __awaiter(this, void 0, void 0, function () {
        var response, filename, writer;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, axios_1.default.get(imageUrl, { responseType: 'stream' })];
                case 1:
                    response = _a.sent();
                    filename = "".concat(title.slice(0, 10).replace(/\s/g, '_'), ".jpg");
                    writer = fs.createWriteStream(filename);
                    response.data.pipe(writer);
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            writer.on('finish', resolve);
                            writer.on('error', reject);
                        })];
            }
        });
    });
}
function translateText(text, source, target) {
    return __awaiter(this, void 0, void 0, function () {
        var apiKey, url, data, response, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    apiKey = 'AIzaSyDZbLWQZbuvwf_PR9FAD6S5d4mRCuGUa3c';
                    url = "https://translation.googleapis.com/language/translate/v2?key=".concat(apiKey);
                    data = {
                        q: text,
                        source: source,
                        target: target,
                        format: 'text',
                    };
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, axios_1.default.post(url, data)];
                case 2:
                    response = _a.sent();
                    return [2 /*return*/, response.data.data.translations[0].translatedText];
                case 3:
                    error_2 = _a.sent();
                    console.error('Translation error:', error_2);
                    return [2 /*return*/, text]; // Fallback to the original text
                case 4: return [2 /*return*/];
            }
        });
    });
}
function analyzeRepeatedWords(titles) {
    var allWords = titles.join(' ').toLowerCase().match(/\w+/g) || [];
    var wordCount = {};
    for (var _i = 0, allWords_1 = allWords; _i < allWords_1.length; _i++) {
        var word = allWords_1[_i];
        wordCount[word] = (wordCount[word] || 0) + 1;
    }
    var repeatedWords = Object.entries(wordCount).filter(function (_a) {
        var _ = _a[0], count = _a[1];
        return count > 2;
    });
    console.log('Repeated Words:', repeatedWords);
}
// Run the scraper
scrapeElPais();
