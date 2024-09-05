import Fastify from "fastify";
import dbConnector from "./dbConnection.js";
import path from "path";
import fastifyView from "@fastify/view";
import fastifyStatic from "@fastify/static";
import handlebars from "handlebars";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
var lang;
const lang_en = require("./locales/lang_en.json");
const lang_tr = require("./locales/lang_tr.json");

const PORT =  10000;
const host = ("RENDER" in process.env) ? `0.0.0.0` : `localhost`;
const assets = 'https://taviloglukoleksiyon.org/eserler';

const dbWorks ='work';
const dbArtists='artist';

const server = Fastify({
  logger: true
});

await server.register(import('@fastify/compress'), { global: true })

server.register(fastifyStatic, {
  root: path.join(import.meta.dirname, 'public'),
});

var dm=true;
/*
server.register(import('@fastify/cookie'), {
  secret: "tavilogluNotSoSecret", // for cookies signature
  hook: 'onRequest', // set to false to disable cookie autoparsing or set autoparsing on any of the following hooks: 'onRequest', 'preParsing', 'preHandler', 'preValidation'. default: 'onRequest'
  parseOptions: {}  // options for parsing cookies
})
*/
server.register(fastifyView, {
  engine: {
    handlebars: handlebars,
  },
  viewExt: "hbs", // Sets the default extension to `.handlebars`
  includeViewExtension: true,
});
server.register(dbConnector);

server.get("/", async function (req, reply) {
  try {
    setLang(req.query);
    setMode(req.query);
    
    const collection = loadWorks();
    const result = await collection.aggregate([{ $sample: { size: 1 } }]).toArray()
    const artistCollection = loadArtists();
    const artistResult = await artistCollection.findOne({'id':result[0].artist_id})
    
    return reply.view("views/wall/home.hbs", { lang: lang, dm: dm,dict:JSON.stringify(lang), title: "grouper", bodyClass: "home",work:JSON.stringify(result), artist:JSON.stringify(artistResult), assets:assets }, {layout: "views/templates/layout.hbs"});
  } catch (error) {
    console.log(error);
    return "Error Found";
  }
});
server.get("/gallery/:group", async function (req, reply) {
  try {
    setLang(req.query);
    setMode(req.query);

    const collection = loadWorks();
    const result = await collection.find().toArray()
    const artistCollection = loadArtists();
    const artistResult = await artistCollection.find().toArray()
    const { group } = req.params;
    console.log(group);
    const grouplist = await collection.distinct(group);
    return reply.view("views/wall/index.hbs", { lang: lang, dm: dm, dict:JSON.stringify(lang),  title: "grouper", bodyClass: "galleryGroup"+group, works:JSON.stringify(result), assets:assets, groups:"",artists:JSON.stringify(artistResult), groupsfieldname: group, groups:JSON.stringify(grouplist) }, {layout: "views/templates/layout.hbs"});
  } catch (error) {
    console.log(error);
    return "Error Found";
  }
});
server.get("/gallery", async function (req, reply) {
  try {
    setLang(req.query);
    setMode(req.query);

    const collection = loadWorks();
    const result = await collection.find().toArray()
    const artistCollection = loadArtists();
    const artistResult = await artistCollection.find().toArray()
    return reply.view("views/wall/index.hbs", { lang: lang, dm: dm, dict:JSON.stringify(lang),  title: "grouper", bodyClass: "gallery", works:JSON.stringify(result), assets:assets, groups:"",artists:JSON.stringify(artistResult), groups:JSON.stringify("[]") }, {layout: "views/templates/layout.hbs"});
   
  } catch (error) {
    console.log(error);
    return "Error Found";
  }
});

server.get("/search/:keywords", async function (req, reply) {
  try {
    setLang(req.query);
    setMode(req.query);

    const regex = new RegExp(req.params.keywords, 'i');
    let wQuery = { $or: [{ title_en: regex }, { title_tr: regex }, { label_en: regex }, { label_tr: regex }] };
    let aQuery = { $or: [{ name: regex }] };

    const collection = loadWorks();
    const artistCollection = loadArtists();
    //const resul= await collection.find(wQuery).toArray()
    const findWorks= await collection.find(wQuery).toArray()
    let artistsWorkId=[];
    findWorks.forEach(result => {artistsWorkId.push(result.artist_id)});
    const findWorksArtists= await artistCollection.find({ $or: [{ id: { "$in":artistsWorkId }}]}).toArray()

    const findArtists= await artistCollection.find(aQuery).toArray()
    
    let artistsArrayId=[];
    findArtists.forEach(result => {artistsArrayId.push(result.id)});
    const findArtistsWorks= await collection.find({ $or: [{ artist_id: { "$in":artistsArrayId }}]}).toArray()

    //const artistResult = await artistCollection.find().toArray()
    return reply.view("views/wall/search.hbs", { lang: lang, dm: dm, dict:JSON.stringify(lang), title: "grouper", keyword:req.params.keywords, bodyClass: "search",
    works:JSON.stringify(findWorks), 
    worksArtists:JSON.stringify(findWorksArtists), 
    artists:JSON.stringify(findArtists),
    artistsWorks:JSON.stringify(findArtistsWorks),
    assets:assets, groups:"", groups:JSON.stringify("[]") }, {layout: "views/templates/layout.hbs"});
   
  } catch (error) {
    console.log(error);
    return "Error Found";
  }
});

server.get("/groups/:group", async function (req, reply) {
  try {
    setLang(req.query);
    setMode(req.query);

    const collection = loadWorks();
    const result = await collection.find().toArray()
    const artistCollection = loadArtists();
    const artistResult = await artistCollection.find().toArray()
    const { group } = req.params;
    const grouplist = await collection.distinct(group);
    
    return reply.view("views/wall/groups.hbs", { lang: lang, dm: dm, dict:JSON.stringify(lang), title: "grouper", bodyClass: "group"+group, works:JSON.stringify(result), assets:assets,groups:"",artists:JSON.stringify(artistResult), groupsfieldname: group, groups:JSON.stringify(grouplist) }, {layout: "views/templates/layout.hbs"});
  } catch (error) {
    console.log(error);
    return "Error Found";
  }
});
server.get("/timeline", async function (req, reply) {
  try {
    setLang(req.query);
    setMode(req.query);

    const collection = loadWorks();
    const result = await collection.find().project({id:1,title:1,date:1}).toArray()
    return reply.view("views/wall/timeline.hbs", { lang: lang, dm: dm, dict:JSON.stringify(lang), title: "grouper", bodyClass: "group", works:JSON.stringify(result), assets:assets}, {layout: "views/templates/layout.hbs"});
  } catch (error) {
    console.log(error);
    return "Error Found";
  }
});

server.ready().then(() => {
  server.listen({ port: PORT, host:host}, (err) => {
    if (err) throw err;
    console.log(`server listening on ${server.server.address().port}`);
  });
});

function setLang(r){
  let lan=r.lan;
    switch(lan) {
      case "tr": lang=lang_tr; break;
      case "en": lang=lang_en; break;
      default: lang=lang_en; break;
    }
    console.log('lang'+lang)
}

function setMode(r){
  if(r.dm!=undefined) dm=r.dm;
  else dm=true;
}

function loadWorks(){
  return server.mongo.db.collection(dbWorks);
}

function loadArtists(){
  return server.mongo.db.collection(dbArtists);
}
