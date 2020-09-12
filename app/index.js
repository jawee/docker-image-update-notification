const dockerApi = require('docker-hub-api');
const fs = require('fs');
const config = require('/usr/src/config/config.json');
const Discord = require('discord.js');
const cachePath = '/usr/src/config/cache.json';

let cache;

let writeToCache = function(data) {
  fs.writeFile(cachePath, JSON.stringify(data), () => {});
}

let initApplication = function() {
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
    }).catch((err) => { console.error(err); reject(err) } );
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
    console.log("Handling " + i.image);
    if(cache == null) {
      console.log("Cache is null, add current info to cache");
      return;
    }
    let cachedImage = cache.filter((elem) => elem.image == i.image);
    if(cachedImage.length == 0) {
      console.log("No cached image, add current info to cache");
      return;
    }
    cachedImage = cachedImage[0];

    if(new Date(cachedImage.last_updated) < new Date(i.last_updated)) {
      webhookClient.send("New image found for " + i.user + "/" + i.image + ":" + i.tag, { username: 'Image Updated', avatarURL: 'https://files.hellracers.se/Moby-logo.png' });
    } else {
      console.log("No new image found for " + i.user + "/" + i.image + ":" + i.tag);
    }
  });
  webhookClient.destroy();
  console.log("done in handleImages");
  writeToCache(imagesInfo);
}

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

