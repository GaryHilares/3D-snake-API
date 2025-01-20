import cors from "cors";
import express from "express";
import bodyParser from "body-parser";
import { MongoClient } from "mongodb";
import "dotenv/config";

const app = express();
app.use(
  cors({
    origin: "*",
  })
);
app.use(bodyParser.json());

app.post("/submit-run", async (req, res) => {
  const cluster = new MongoClient(
    `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_HOST}/?retryWrites=true&w=majority`
  );
  const db = cluster.db("3D-snake");
  const dataCollection = db.collection("data");
  const data = await dataCollection.findOne({});
  if (!req.body || !req.body.score || typeof req.body.score !== "number") {
    res.status(403);
    res.send("Malformed request");
  } else {
    data.runCount++;
    data.highscore = Math.max(data.highscore, req.body.score);
    dataCollection.updateOne(
      { _id: data._id },
      {
        $set: {
          highscore: data.highscore,
          runCount: data.runCount,
        },
      }
    );
    res.status(200);
    res.send({ runCount: data.runCount, highscore: data.highscore });
  }
});

app.listen(3000, () => {
  console.log("Listening to port 3000.");
});

export default app;
