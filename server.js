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
    //console.log(req.query.params)
    //console.log("the selected language is "+ req.query.lan)
    setLang(req.query);
    setMode(req.query);
    // console.log(lang);
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
    const resul= await collection.find(wQuery).toArray()
    const resul2= await artistCollection.find(aQuery).toArray()
    const artistResult = await artistCollection.find().toArray()
    
   // console.log(JSON.stringify(resul))
   // console.log(JSON.stringify(resul2))
    const dbLen=resul.length;
   return reply.view("views/wall/search.hbs", { lang: lang, dm: dm, dict:JSON.stringify(lang), title: "grouper", keyword:req.params.keywords, dbLength: dbLen, bodyClass: "search", works:JSON.stringify(resul), assets:assets, groups:"",artists:JSON.stringify(artistResult), groups:JSON.stringify("[]") }, {layout: "views/templates/layout.hbs"});
   
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
   // console.log(group);
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
    //if(lan!=undefined)
    switch(lan) {
      case "tr": lang=lang_tr; break;
      case "en": lang=lang_en; break;
      default: lang=lang_en; break;
    }
    console.log('lang'+lang)
}

function setMode(r){
  //let dm=;
  if(r.dm!=undefined) dm=r.dm;
  else dm=true;
    //if(lan!=undefined)
    /*switch(dm) {
      case "tr": lang=lang_tr; break;
      case "en": lang=lang_en; break;
      default: lang=lang_en; break;
    }*/
    //console.log('lang'+lang)
}

function loadWorks(){
  return server.mongo.db.collection(dbWorks);
}

function loadArtists(){
  return server.mongo.db.collection(dbArtists);
}
