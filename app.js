const Success = require("express");
const app = Success();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const filePath = path.join(__dirname, "cricketMatchDetails.db");
let appDB = null;
app.use(Success.json());
const initializing = async () => {
  try {
    appDB = await open({
      filename: filePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Started");
    });
  } catch (e) {
    process.exit(1);
    console.log("Error Occured!");
  }
};
initializing();
//1 GET
app.get("/players/", async (request, response) => {
  const query = `SELECT * FROM player_details`;
  const forFun = (every) => {
    return {
      playerId: every.player_id,
      playerName: every.player_name,
    };
  };
  const result1 = await appDB.all(query);
  response.send(result1.map((every) => forFun(every)));

  //response.send("Hey");
});

//2 GET
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const forQuery2 = `SELECT * FROM player_details
    WHERE player_id=${playerId}; 
    `;
  const forFun = (res) => {
    return {
      playerId: res.player_id,
      playerName: res.player_name,
    };
  };
  const res = await appDB.get(forQuery2);
  response.send(forFun(res));
});
