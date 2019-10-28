import * as express from "express";
import { MongoHelper } from "./data/MongoHelper"

const app = express();

app.get("/", (req, res) => {
  const collection: any = MongoHelper.getCollection();
  const result = collection.find({}).toArray((err, items) => {
    if (err) {
      console.error('Caught error', err);
    } else {
      items = items.map((item) => { return item});
      res.send("VDH API 1.0.0" + items)
    }
  });
})

const PORT = process.env.PORT || 3000;


app.listen(PORT, async () => {
  console.log(`Server is running in http://localhost:${PORT}`)
  try {
    await MongoHelper.connect(`mongodb://vdh-db:27017/vdhObservationCollection`);
    console.info(`Connected to Mongo!`);
  } catch (err) {
    console.error(`Unable to connect to Mongo!`, err);
  }
})
