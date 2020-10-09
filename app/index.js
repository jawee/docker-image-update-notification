const dockerApi = require('docker-hub-api');
const fs = require('fs');
const config = require('/usr/src/config/config.json');
const Discord = require('discord.js');
const cachePath = '/usr/src/config/cache.json';

let cache;

const logFilePath = '/usr/src/config/log.json';

let writeToLog = function(data) {
  if(!fs.existsSync(logFilePath)) {
    fs.writeFileSync(logFilePath, "", null);
  }
  let currTime = new Date();

  fs.appendFileSync(logFilePath, "Debug " + currTime + " > " + JSON.stringify(data) + '\n');
  console.log(currTime + " > " + JSON.stringify(data));
}

let writeErrorToLog = function(data) {
  if(!fs.existsSync(logFilePath)) {
    fs.writeFileSync(logFilePath, "", null);
  }
  let currTime = new Date();

  fs.appendFileSync(logFilePath, "ERROR "  + currTime + " > " + JSON.stringify(data) + '\n');
  console.error(currTime + " > " + JSON.stringify(data));
}

let writeToCache = function(data) {
  fs.writeFile(cachePath, JSON.stringify(data), () => {});
}

let initApplication = function() {

  console.log("In init application");
  dockerApi.setCacheOptions({enabled: true, time:60});
  if(!fs.existsSync(cachePath)) {
    fs.writeFileSync(cachePath, "", null);
  }
  cacheFile = fs.readFileSync(cachePath, 'utf-8');
  if(cacheFile == null || cacheFile == "") {
    cache = null;
  } else {
    cache = JSON.parse(cacheFile);
  }
}

var getImageInformation = function(imageConfig) {
  return new Promise((resolve, reject) => {
    dockerApi.tags(imageConfig.user, imageConfig.image).then((tags) => {
      let tagInfo = tags.filter((t) => t.name == imageConfig.tag );
      if(tagInfo.length > 0) {
        tagInfo = tagInfo[0];
      } else {
        return;
      }
      imageConfig.last_updated = tagInfo.last_updated;
      resolve(imageConfig);
    }).catch((err) => { writeErrorToLog(err); reject(err) } );
  });
}

let getImageInformations = function() {
  return new Promise((resolve, reject) => {
    let requests = [];
    config.images.forEach(i => {
      requests.push(getImageInformation(i));
    }); 

    Promise.all(requests).then((res) => {
      resolve(res);
    });
  });
}

let handleImages = function(imagesInfo) {
  const webhookClient = new Discord.WebhookClient(config.webhookId, config.webhookToken);

  imagesInfo.forEach((i) => {
    writeToLog("Handling " + i.image);
    if(cache == null) {
      writeToLog("Cache is null, add current info to cache");
      return;
    }
    let cachedImage = cache.filter((elem) => elem.image == i.image);
    if(cachedImage.length == 0) {
      writeToLog("No cached image, add current info to cache");
      return;
    }
    cachedImage = cachedImage[0];

    if(new Date(cachedImage.last_updated) < new Date(i.last_updated)) {
      webhookClient.send("New image found for " + i.user + "/" + i.image + ":" + i.tag, { username: 'Image Updated', avatarURL: 'https://files.hellracers.se/Moby-logo.png' });
    } else {
      writeToLog("No new image found for " + i.user + "/" + i.image + ":" + i.tag);
    }
  });
  webhookClient.destroy();
  writeToLog("done in handleImages");
  writeToCache(imagesInfo);
}

console.log("Application started");
initApplication();
getImageInformations().then(res => { 
  handleImages(res); 
});

//TODO 1: Change to check once an hour
setInterval(() => { 
  initApplication();
  getImageInformations().then(res => { 
    handleImages(res); 
  });
}, 60*1000*60);

