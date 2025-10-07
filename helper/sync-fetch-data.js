const fs = require('fs');
const fetch = require('sync-fetch');

const dataTypes = {
  'archivals': 'cda-archivals-v2',
  'graphics-real': 'cda-graphics-v2.real',
  'graphics-virtual': 'cda-graphics-v2.virtual',
  'literature': 'cda-literaturereferences-v2',
  'paintings': 'cda-paintings-v2',
  'thesaurus': 'cda-thesaurus-v2',
  'drawings': 'cda-drawings-v2',
};

const checkCacheFolder = (cacheFolder) => {
  try {
    if (!fs.existsSync(cacheFolder)) {
      fs.mkdirSync(cacheFolder);
    }
  } catch (err) {
    console.error(err);
  }
}

const getCacheFileName = (cacheFolder, params) => {
  const { lang, type } = params;

  const cacheFileName = type === 'thesaurus'
    ? `${cacheFolder}/${dataTypes[type]}.json`
    : `${cacheFolder}/${dataTypes[type]}.${lang}.json`;
  return cacheFileName;
}

module.exports = fetchData = function (params) {
  const apiUrl = process.env.API_ENDPOINT;
  const cacheFolder = process.env.CACHE_FOLDER;
  const { lang } = params;
  const { type } = params;
  
  checkCacheFolder(cacheFolder);
  const cacheFile = getCacheFileName(cacheFolder, params); 

  if (fs.existsSync(cacheFile)) {
    const file = fs.readFileSync(cacheFile, 'utf8');
    return JSON.parse(file);
  }

  const url = `${apiUrl}?lang=${lang}&type=${type}`;
  console.log("Fetching data from: " + url)

  const data = fetch(url, {
    headers: {
      "x-api-key": process.env.API_KEY,
      "Content-Type": "application/json"
    }
  }).json();

  fs.writeFileSync(cacheFile, JSON.stringify(data));

  return data;

};

