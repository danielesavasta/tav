import Fastify from "fastify";
import dbConnector from "./dbConnection.js";
import path from "path";
import fastifyView from "@fastify/view";
import fastifyStatic from "@fastify/static";
import handlebars from "handlebars";
//import fastifyWs from "@fastify/websocket";

const PORT =  10000;
const host = ("RENDER" in process.env) ? `0.0.0.0` : `localhost`;
const assets = 'https://taviloglukoleksiyon.org/eserler'//https://taviloglukoleksiyon.org/eserler';

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

var hbs = handlebars.create({});

/*
server.register(fastifyWs, {
  clientTracking: true // enable client tracking
});*/

server.register(dbConnector);
server.get("/", async function (req, reply) {
  try {
    const collection = server.mongo.db.collection(dbWorks)
    const result = await collection.aggregate([{ $sample: { size: 1 } }]).toArray()
    const artistCollection = server.mongo.db.collection(dbArtists)
    const artistResult = await artistCollection.findOne({'id':result[0].artist_id})
    
    return reply.view("views/wall/home.hbs", { title: "grouper", bodyClass: "home",work:JSON.stringify(result), artist:JSON.stringify(artistResult), assets:assets }, {layout: "views/templates/layout.hbs"});
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
    return reply.view("views/wall/index.hbs", { title: "grouper", bodyClass: "galleryGroup"+group, works:JSON.stringify(result), assets:assets, groups:"",artists:JSON.stringify(artistResult), groupsfieldname: group, groups:JSON.stringify(grouplist) }, {layout: "views/templates/layout.hbs"});
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
   return reply.view("views/wall/index.hbs", { title: "grouper", bodyClass: "gallery", works:JSON.stringify(result), assets:assets, groups:"",artists:JSON.stringify(artistResult), groups:JSON.stringify("[]") }, {layout: "views/templates/layout.hbs"});
   
  } catch (error) {
    console.log(error);
    return "Error Found";
  }
});

server.get("/search/:keywords", async function (req, reply) {
  try {
   // let  key  = "\"Street\"";
    //`\"${req.params.keywords}\"`;
    //console.log(req.params);
   // console.log(key);
    const regex = new RegExp(req.params.keywords, 'i');
    let wQuery = { $or: [{ title_en: regex }, { title_tr: regex }, { label_en: regex }, { label_tr: regex }] };
    let aQuery = { $or: [{ name: regex }] };
    //const index = await server.mongo.db.collection(dbWorks).createIndex({field:"text"});
    const collection = await server.mongo.db.collection(dbWorks)
    const resul=  await collection.find(wQuery).toArray()
    const resul2=  await artistCollection.find(aQuery).toArray()
    const dbLen=resul.length;
    //const result = await collection.find( { $text: { $search: /treet/i }})
   // console.log("index>"+index);
    //console.log(resul);
    const artistCollection = server.mongo.db.collection(dbArtists)
    const artistResult = await artistCollection.find().toArray()
   return reply.view("views/wall/search.hbs", { title: "grouper", keyword:req.params.keywords, dbLength: dbLen, bodyClass: "search", works:JSON.stringify(resul), assets:assets, groups:"",artists:JSON.stringify(artistResult), groups:JSON.stringify("[]") }, {layout: "views/templates/layout.hbs"});
   
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
    return reply.view("views/wall/groups.hbs", { title: "grouper", bodyClass: "group"+group, works:JSON.stringify(result), assets:assets,groups:"",artists:JSON.stringify(artistResult), groupsfieldname: group, groups:JSON.stringify(grouplist) }, {layout: "views/templates/layout.hbs"});
  } catch (error) {
    console.log(error);
    return "Error Found";
  }
});
server.get("/timeline", async function (req, reply) {
  try {
    const collection = server.mongo.db.collection(dbWorks)
    const result = await collection.find().project({id:1,title:1,date:1}).toArray()
    return reply.view("views/wall/timeline.hbs", { title: "grouper", bodyClass: "group", works:JSON.stringify(result), assets:assets}, {layout: "views/templates/layout.hbs"});
  } catch (error) {
    console.log(error);
    return "Error Found";
  }
});
/*server.get("/about", async function (req, reply) {
  return reply.view("views/wall/about.hbs", { title: "about"}, {layout: "views/templates/layout.hbs"});
  });*/
  /*
server.get("/controller", async function (req, reply) {
  try {
    const collection = server.mongo.db.collection(dbWorks)
    const artistCollection = server.mongo.db.collection(dbArtists)
    const artistResult = await artistCollection.find().toArray()
    var groups = await collection.distinct("technique");
    let imagesByGroups = [];
    let j = 0,
    lenj = groups.length;
     while(j<lenj) {
      let one=groups[j].split(",");
      one.forEach((thisone) => {
        let newItem=thisone.trim().toLowerCase();
        imagesByGroups.indexOf(newItem) === -1 ? imagesByGroups.push(newItem) : console.log("This item already exists");
       });
       j++;
     }
    const techniquesResult=imagesByGroups;
    return reply.view("views/mobile/index.hbs", { title: "grouper", artists:JSON.stringify(artistResult), assets:assets, techniques:JSON.stringify(techniquesResult) },{layout:"views/templates/mobile.hbs"}); //{layout:"views/templates/mobile.hbs"},
  } catch (error) {
    console.log(error);
    return "Error Found";
  }
});
server.register(async function (server) {
server.get('/comm', { websocket: true }, (connection, req) => {
  // New user
  broadcast({
      sender: '__server',
      message: `new connection established`
  });
  // Leaving user
  connection.on('close', () => {
      broadcast({
          sender: '__server',
          message: `severed connection`
      });
  });
 // Broadcast incoming message
  connection.on('message', (message) => {
      message = JSON.parse(message.toString());
      console.log(message)
      broadcast({
          ...message
      });
  });
});
});*/
server.ready().then(() => {
  server.listen({ port: PORT, host:host}, (err) => {
    if (err) throw err;
    console.log(`server listening on ${server.server.address().port}`);
  });
});
function broadcast(message) {
  for(let client of server.websocketServer.clients) {
      client.send(JSON.stringify(message));
  }
}