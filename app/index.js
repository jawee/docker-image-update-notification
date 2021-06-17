const dockerApi = require('docker-hub-api');
const fs = require('fs');
const basePath = '/usr/src/config/';
const config = require(basePath + 'config.json');
const Discord = require('discord.js');
const { Octokit } = require("@octokit/core");
const cachePath = basePath + 'cache.json';
let cache;

let octokit;

const logFilePath = basePath + 'log.json';

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

  octokit = new Octokit({ auth: config.github_access_token });
}

let getImageInformation = function(imageConfig) {
  return new Promise((resolve, reject) => {
    if(imageConfig.registry === 'docker') {
      dockerApi.tags(imageConfig.user, imageConfig.image).then((tags) => {
        writeToLog("inside dockerApi got tag info for " + imageConfig.user + "/" + imageConfig.image + ":" + imageConfig.tag);
        let tagInfo = tags.filter((t) => t.name == imageConfig.tag );
        if(tagInfo.length > 0) {
          tagInfo = tagInfo[0];
        } else {
          //TODO 1: Should probably not be a resolve, should be a reject. But Promise.all needs to be replaced
          writeToLog("resolving null for " + imageConfig.user + "/" + imageConfig.image + ":" + imageConfig.tag);
          resolve(null);
          //reject("taginfo.length is 0 for " + imageConfig.user + "/" + imageConfig.image + ":" + imageConfig.tag);
        }
        imageConfig.last_updated = tagInfo.last_updated;
        console.log(tagInfo.last_updated);
        writeToLog("resolving imageConfig in getImageInformation for image " + imageConfig.user + "/" + imageConfig.image + ":" + imageConfig.tag);
        resolve(imageConfig);
      }).catch((err) => { writeErrorToLog(err); reject(err) } );
    } else if(imageConfig.registry === 'github') {
      octokit.request("GET /repos/{owner}/{repo}/releases/latest", {
        owner: imageConfig.user,
        repo: imageConfig.image
      }).then((res) => {
        if(res.status === 200) {
          imageConfig.last_updated = res.data.published_at;
          resolve(imageConfig);
        } else {
          resolve(null);
        }
      }).catch((err) => { writeErrorToLog(err); reject(err) });
    }
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
  let newImagesInfo = [];
  imagesInfo.forEach((i) => {
    if(i == null) {
      writeToLog("Image is null, not doing anything");
      return;
    }
    writeToLog("Handling " + i.image);
    if(cache == null) {
      writeToLog("Cache is null, add current info to cache");
      newImagesInfo.push(i);
      return;
    }
    let cachedImage = cache.filter((elem) => elem.image == i.image && elem.user == i.user);
    if(cachedImage.length == 0) {
      writeToLog("No cached image, add current info to cache");
      newImagesInfo.push(i);
      return;
    }
    cachedImage = cachedImage[0];
    console.log(i.user + "/" + i.image + " = " + cachedImage.user + "/" + cachedImage.image);
    if(new Date(cachedImage.last_updated) < new Date(i.last_updated)) {
      webhookClient.send("New image found for " + i.user + "/" + i.image + ":" + i.tag + " on " + i.registry, { username: 'Image Updated', avatarURL: 'https://files.hellracers.se/Moby-logo.png' });
      newImagesInfo.push(i);
    } else {
      writeToLog("No new image found for " + i.user + "/" + i.image + ":" + i.tag);
      newImagesInfo.push(i);
    }
  });
  webhookClient.destroy();
  writeToLog("done in handleImages");
  writeToCache(newImagesInfo);
}

console.log("Application started");
initApplication();
getImageInformations().then(res => { 
  handleImages(res); 
});

setInterval(() => { 
  initApplication();
  getImageInformations().then(res => { 
    handleImages(res); 
  });
}, 60*1000*60);

