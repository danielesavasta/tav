import Fastify from "fastify";
import dbConnector from "./dbConnection.js";
import path from "path";
import fastifyView from "@fastify/view";
import fastifyStatic from "@fastify/static";
import handlebars from "handlebars";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const lang_en = require("./locales/lang_en.json");

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

server.register(fastifyView, {
  engine: {
    handlebars: handlebars,
  },
  viewExt: "hbs", // Sets the default extension to `.handlebars`
  includeViewExtension: true,
});
server.register(dbConnector);

//import lang_en = ("locale/lang_en.json")
//const lang_tr = require('./locale/lang_tr.json')

server.get("/", async function (req, reply) {
  try {
    const collection = server.mongo.db.collection(dbWorks)
    const result = await collection.aggregate([{ $sample: { size: 1 } }]).toArray()
    const artistCollection = server.mongo.db.collection(dbArtists)
    const artistResult = await artistCollection.findOne({'id':result[0].artist_id})
    
    return reply.view("views/wall/home.hbs", { lang: lang_en, dict:JSON.stringify(lang_en), title: "grouper", bodyClass: "home",work:JSON.stringify(result), artist:JSON.stringify(artistResult), assets:assets }, {layout: "views/templates/layout.hbs"});
  } catch (error) {
    console.log(error);
    return "Error Found";
  }
});
server.get("/gallery/:group", async function (req, reply) {
  try {
    const collection = server.mongo.db.collection(dbWorks)
    const result = await collection.find().toArray()
    const artistCollection = server.mongo.db.collection(dbArtists)
    const artistResult = await artistCollection.find().toArray()
    const { group } = req.params;
    console.log(group);
    const grouplist = await collection.distinct(group);
    return reply.view("views/wall/index.hbs", { lang: lang_en, dict:JSON.stringify(lang_en),  title: "grouper", bodyClass: "galleryGroup"+group, works:JSON.stringify(result), assets:assets, groups:"",artists:JSON.stringify(artistResult), groupsfieldname: group, groups:JSON.stringify(grouplist) }, {layout: "views/templates/layout.hbs"});
  } catch (error) {
    console.log(error);
    return "Error Found";
  }
});
server.get("/gallery", async function (req, reply) {
  try {
    const collection = server.mongo.db.collection(dbWorks)
    const result = await collection.find().toArray()
    const artistCollection = server.mongo.db.collection(dbArtists)
    const artistResult = await artistCollection.find().toArray()
   return reply.view("views/wall/index.hbs", { lang: lang_en, dict:JSON.stringify(lang_en),  title: "grouper", bodyClass: "gallery", works:JSON.stringify(result), assets:assets, groups:"",artists:JSON.stringify(artistResult), groups:JSON.stringify("[]") }, {layout: "views/templates/layout.hbs"});
   
  } catch (error) {
    console.log(error);
    return "Error Found";
  }
});

server.get("/search/:keywords", async function (req, reply) {
  try {
    const regex = new RegExp(req.params.keywords, 'i');
    let wQuery = { $or: [{ title_en: regex }, { title_tr: regex }, { label_en: regex }, { label_tr: regex }] };
    let aQuery = { $or: [{ name: regex }] };
    const collection = await server.mongo.db.collection(dbWorks)
    const artistCollection = server.mongo.db.collection(dbArtists)
    const resul= await collection.find(wQuery).toArray()
    const resul2= await artistCollection.find(aQuery).toArray()
    const artistResult = await artistCollection.find().toArray()
    
    console.log(JSON.stringify(resul))
    console.log(JSON.stringify(resul2))
    const dbLen=resul.length;
   return reply.view("views/wall/search.hbs", { lang: lang_en, dict:JSON.stringify(lang_en), title: "grouper", keyword:req.params.keywords, dbLength: dbLen, bodyClass: "search", works:JSON.stringify(resul), assets:assets, groups:"",artists:JSON.stringify(artistResult), groups:JSON.stringify("[]") }, {layout: "views/templates/layout.hbs"});
   
  } catch (error) {
    console.log(error);
    return "Error Found";
  }
});

server.get("/groups/:group", async function (req, reply) {
  try {
    const collection = server.mongo.db.collection(dbWorks)
    const result = await collection.find().toArray()
    const artistCollection = server.mongo.db.collection(dbArtists)
    const artistResult = await artistCollection.find().toArray()
    const { group } = req.params;
   // console.log(group);
    const grouplist = await collection.distinct(group);
    return reply.view("views/wall/groups.hbs", { lang: lang_en, dict:JSON.stringify(lang_en), title: "grouper", bodyClass: "group"+group, works:JSON.stringify(result), assets:assets,groups:"",artists:JSON.stringify(artistResult), groupsfieldname: group, groups:JSON.stringify(grouplist) }, {layout: "views/templates/layout.hbs"});
  } catch (error) {
    console.log(error);
    return "Error Found";
  }
});
server.get("/timeline", async function (req, reply) {
  try {
    const collection = server.mongo.db.collection(dbWorks)
    const result = await collection.find().project({id:1,title:1,date:1}).toArray()
    return reply.view("views/wall/timeline.hbs", { lang: lang_en, dict:JSON.stringify(lang_en), title: "grouper", bodyClass: "group", works:JSON.stringify(result), assets:assets}, {layout: "views/templates/layout.hbs"});
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

