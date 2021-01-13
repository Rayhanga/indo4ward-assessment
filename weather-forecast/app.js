const http = require('http')
const puppeteer = require('puppeteer')
const cheerio = require('cheerio')

const hostname = '127.0.0.1'
const port = 3000
const url = 'https://www.nea.gov.sg/weather'

async function getData(){
    const chromeOptions = {
        headless: true,
        defaultViewport: null,
        args: [
            "--incognito",
            "--no-sandbox",
            "--single-process",
            "--no-zygote"
        ],
    };
    const browser = await puppeteer.launch(chromeOptions)
    const page = await browser.newPage();
    await page.setViewport({width: 1920, height: 1080})

    await page.setRequestInterception(true);
    page.on('request', (req) => {
        if(req.resourceType() === 'stylesheet' || req.resourceType() === 'image'){
            req.abort();
        }
        else {
            req.continue();
        }
    })

    await page.goto(url, {waitUntil: 'domcontentloaded', timeout: 0})
    await page.waitForSelector('div.stats-data--4days__item', {visible: true,})

    const html = await page.content()  
    await browser.close()
    return html
}

async function parseData(){
    const html = await getData()
    const $ = cheerio.load(html)
    let data = []
    $('div.stats-data--4days__item').each((index, element) => {
        if(index < 4){
            const el = cheerio.load(cheerio.html(element))
            const img = 'https://www.nea.gov.sg'+(el('img').attr('src'))
            const day = cheerio.text(el('span.day'))
            const info = cheerio.text(el('span.info'))
            let temp, wind
            el('div.info').each((idx, elm) => {
                const el = cheerio.load(cheerio.html(elm))
                temp = idx === 0 ? cheerio.text(el('span')) : temp
                wind = idx === 1 ? cheerio.text(el('span')) : wind
            })
            data.push({
                img, day, info, temp, wind
            })
        }
    })
    return data
}


function generateCards(data) {
    let generatedCards = ""
    data.forEach(datum => {
        const cardTemplate = `
        <div class="card align-items-center">
            <img src="${datum.img}" class="card-img-top w-50" alt="${datum.info}">
            <div class="card-body">
                <h5 class="card-title">
                    <span class="align-middle">${datum.day}</span>
                </h5>
                <p class="card-text">
                    <i class="bi bi-info-circle"></i>
                    <span class="align-middle">${datum.info}</span>
                </p>
                <div class="row justify-content-center align-items-center">
                    <div class="col">
                        <i class="bi bi-thermometer"></i>
                        <span class="align-middle">${datum.temp}</span>
                    </div>
                    <div class="col">
                        <i class="bi bi-speedometer2"></i>
                        <span class="align-middle">${datum.wind}</span>
                    </div>
                </div>
            </div>
        </div>`
        generatedCards = generatedCards + cardTemplate
    })
    return generatedCards
}

const server = http.createServer((req, res) => {
    parseData().then(data => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');
        res.end(`<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta1/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-giJF6kkoqNQ00vy+HMDP7azOuL0xtbfIcaT9wjKHr8RbDVddVHyTfAAsrekwKmP1" crossorigin="anonymous">
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.3.0/font/bootstrap-icons.css">
            <title>Four Day Weather Forecast</title>
        </head>
        <body>
            <main class="container min-vh-100">
                <div class="d-flex flex-column min-vh-100 row mx-auto align-items-center justify-content-center text-center gap-5">
                    <h1>Four Day Weather Forecast</h1>
                    <div class="d-flex flex-column flex-md-row mx-auto align-items-center justify-content-center gap-5">
                        ${generateCards(data)}
                    </div>
                </div>
            </main>
        </body>
        </html>`)
    })
});


server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`)
});