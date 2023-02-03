const puppeteer = require('puppeteer');
const csvWriter = require('csv-writer').createObjectCsvWriter;

const fileCsv = csvWriter({
    path : './books.csv',
    fileDelimiter : ';',
    header : [{id : 'bookName', title : 'Books Names'},
              {id : 'bookPrice', title : 'Books Prices'},
              {id : 'bookStarVal', title : 'Book Stars'},
              {id : 'bookUrlFull', title : 'Book URLs'}]
});
//test

const bot = {
    browser : null,
    page : null,

    init : async() => {
        bot.browser = await puppeteer.launch({headless: false});
        bot.page = await bot.browser.newPage();
        bot.page.setUserAgent('Mozilla/5.0 (X11; linux x86_64) AppleWebkit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36',);
    },

    start : async() => {

        for (var i=1; i<=50; i++){
            const urlWeb = "https://books.toscrape.com/catalogue/page-"+i+".html";
            await bot.page.goto(urlWeb, {waitUntil : 'networkidle2'});
            await bot.scrape();
        }
    },

    scrape : async() => {
        const targets = await bot.page.$$('li.col-xs-6.col-sm-4.col-md-3.col-lg-3');
        for (const target of targets){
            try {
                const bookName = await target.$eval('h3 a', el => el.getAttribute('title'));
                // console.log(bookName);

                const bookPrice = await target.$eval('div.product_price p.price_color', el => el.textContent);
                // console.log(bookPrice);

                const bookStar = await target.$eval('article.product_pod p', el => el.getAttribute('class'));
                const bookStarArr = bookStar.split(' ');
                // const bookStarVal = bookStarArr[1];
                const bookStarVal = bot.fixStarValue(bookStarArr[1]);
                // console.log('Star '+bookStarVal);

                const bookUrl = await target.$eval('div.image_container a', el => el.getAttribute('href'));
                const bookUrlFull = "https://books.toscrape.com/catalogue/"+bookUrl+"\n";
                console.log(bookUrlFull);

                let item = [];
                item.push({
                    bookName,
                    bookPrice,
                    bookStarVal,
                    bookUrlFull
                });
                await fileCsv.writeRecords(item).then(() => console.log(bookName + "has been add to csv"));

                console.log("------------------------------------------------------------");

            } catch (error) {
                console.log(error);
            }
        }
    },

    fixStarValue: (val) => {
        let newVal = 0;
        switch(val){
            case "One": newVal = 1; break;
            case "Two": newVal = 2; break;
            case "Three": newVal = 3; break;
            case "Four": newVal = 4; break;
            case "Five": newVal = 5; break;
        } return newVal;
    }
}

module.exports = bot;
