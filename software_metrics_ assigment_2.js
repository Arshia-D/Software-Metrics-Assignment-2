const { Builder } = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
const fs = require('fs');

async function measurePerformance(url) {
    let options = new firefox.Options();
    let driver = await new Builder().forBrowser('firefox').setFirefoxOptions(options).build();

    try {
        let metricsArray = [];

        for (let i = 0; i < 10; i++) {
            await driver.get(url);

            let metrics = await driver.executeScript("return window.performance.getEntries();");
            metricsArray.push(metrics);
        }

        let averagedMetrics = calculateAverage(metricsArray);
        writeToJson(averagedMetrics, 'performance.json');
        convertToJsonAndWriteCsv(averagedMetrics, 'performance.csv');
    }
    finally {
        await driver.quit();
    }
}

function calculateAverage(metricsArray) {
    let sumMetrics = {};
    let countMetrics = {};

    metricsArray.forEach(metrics => {
        metrics.forEach(metric => {
            if (!sumMetrics[metric.name]) {
                sumMetrics[metric.name] = 0;
                countMetrics[metric.name] = 0;
            }
            sumMetrics[metric.name] += metric.duration;
            countMetrics[metric.name]++;
        });
    });

    let avgMetrics = {};
    for (let metric in sumMetrics) {
        avgMetrics[metric] = sumMetrics[metric] / countMetrics[metric];
    }

    return avgMetrics;
}

function writeToJson(data, filename) {
    fs.writeFileSync(filename, JSON.stringify(data, null, 2));
}

function convertToJsonAndWriteCsv(data, filename) {
    let csvContent = "name,duration\n";
    for (let metric in data) {
        csvContent += `${metric},${data[metric]}\n`;
    }
    fs.writeFileSync(filename, csvContent);
}

measurePerformance('https://en.wikipedia.org/wiki/Software_metric');
