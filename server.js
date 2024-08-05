
//run nodemon --exec npm start
import Fastify from "fastify";
import dbConnector from "./dbConnection.js";
//import router from './routes/router.js'
import path from "path";
import fastifyView from "@fastify/view";
import fastifyStatic from "@fastify/static";
import handlebars from "handlebars";
import fastifyWs from "@fastify/websocket";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const server = Fastify({
  logger: true
});

await server.register(import('@fastify/compress'), { global: true })
server.register(fastifyStatic, {
  root: path.join(__dirname, 'public'),
  //prefix: '/',
});

server.register(fastifyView, {
  engine: {
    handlebars: handlebars,
  },
  //root: path.join("./", "views"), // Points to `./views` relative to the current file
  viewExt: "hbs", // Sets the default extension to `.handlebars`
  //layout: "views/templates/layout.hbs", // Sets the layout to use to `./views/templates/layout.handlebars` relative to the current file.
  includeViewExtension: true,
  /*
  propertyName: "render", // The template can now be rendered via `reply.render()` and `fastify.render()`
  defaultContext: {
    dev: process.env.NODE_ENV === "development", // Inside your templates, `dev` will be `true` if the expression evaluates to true
  },
  options: {}, // No options passed to handlebars
  */
});
var hbs = handlebars.create({});

server.register(fastifyWs, {
  clientTracking: true // enable client tracking
});
server.register(dbConnector);
//fastify.register(router);

server.get("/", async function (req, reply) {
  try {
    const collection = server.mongo.db.collection('works')
    const result = await collection.find().project({id:1,title:1,artist_id:1}).toArray()
    return reply.view("views/wall/index.hbs", { title: "grouper", works:JSON.stringify(result) }, {layout: "views/templates/layout.hbs"});
  } catch (error) {
    console.log(error);
    return "Error Found";
  }
});

server.get("/gallery/:group", async function (req, reply) {
  try {
    const collection = server.mongo.db.collection('works')
    //const group = await collection.distinct("type")
    const result = await collection.find().toArray()
    const artistCollection = server.mongo.db.collection('artists')
    const artistResult = await artistCollection.find().toArray()
    const { group } = req.params;
    console.log(group);
    const grouplist = await collection.distinct(group);

    return reply.view("views/wall/index.hbs", { title: "grouper", works:JSON.stringify(result),groups:"",artists:JSON.stringify(artistResult), groupsfieldname: group, groups:JSON.stringify(grouplist) }, {layout: "views/templates/layout.hbs"});
  } catch (error) {
    console.log(error);
    return "Error Found";
  }
});

server.get("/gallery", async function (req, reply) {
  try {
    const collection = server.mongo.db.collection('works')
    const result = await collection.find().toArray()
    const artistCollection = server.mongo.db.collection('artists')
    const artistResult = await artistCollection.find().toArray()
   return reply.view("views/wall/index.hbs", { title: "grouper", works:JSON.stringify(result),groups:"",artists:JSON.stringify(artistResult), groups:JSON.stringify("[]") }, {layout: "views/templates/layout.hbs"});
   
  } catch (error) {
    console.log(error);
    return "Error Found";
  }
});

server.get("/groups/:group", async function (req, reply) {
  try {
    const collection = server.mongo.db.collection('works')
    const result = await collection.find().toArray()
    const artistCollection = server.mongo.db.collection('artists')
    const artistResult = await artistCollection.find().toArray()
    const { group } = req.params;
    console.log(group);
    const grouplist = await collection.distinct(group);

    return reply.view("views/wall/groups.hbs", { title: "grouper", works:JSON.stringify(result),groups:"",artists:JSON.stringify(artistResult), groupsfieldname: group, groups:JSON.stringify(grouplist) }, {layout: "views/templates/layout.hbs"});
  } catch (error) {
    console.log(error);
    return "Error Found";
  }
});

server.get("/timeline", async function (req, reply) {
  try {
    const collection = server.mongo.db.collection('works')
    const result = await collection.find().project({id:1,title:1,date:1}).toArray()
    return reply.view("views/wall/timeline.hbs", { title: "grouper", works:JSON.stringify(result)}, {layout: "views/templates/layout.hbs"});
  } catch (error) {
    console.log(error);
    return "Error Found";
  }
});

server.get("/controller", async function (req, reply) {
  try {
    const collection = server.mongo.db.collection('works')
    //const result = await collection.find().project({id:1,title:1,date:1}).toArray()
    const artistCollection = server.mongo.db.collection('artists')
    const artistResult = await artistCollection.find().toArray()

    //const materialResult = await collection.distinct("material");
    var groups = await collection.distinct("technique");
    //const grouplist = await collection.distinct(group);
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

    return reply.view("views/mobile/index.hbs", { title: "grouper", artists:JSON.stringify(artistResult), techniques:JSON.stringify(techniquesResult) },{layout:"views/templates/mobile.hbs"}); //{layout:"views/templates/mobile.hbs"},
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
});

server.ready().then(() => {
  server.listen({ port: 3000/*, host: '192.168.137.1'*/}, (err) => {
    if (err) throw err;
    console.log(`server listening on ${server.server.address().port}`);
  });
});

function broadcast(message) {
  for(let client of server.websocketServer.clients) {
      client.send(JSON.stringify(message));
  }
}