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

//3 PUT
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const details = request.body;
  const { playerName } = details;
  const updateQuery = `UPDATE player_details
    SET player_name='${playerName}'
    WHERE player_id=${playerId};`;
  const res3 = await appDB.run(updateQuery);
  response.send("Player Details Updated");
});

//4 get
app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const query4 = `
    SELECT * FROM match_details
    WHERE match_id=${matchId};
    `;
  const forRes = await appDB.get(query4);
  response.send({
    matchId: forRes.match_id,
    match: forRes.match,
    year: forRes.year,
  });
});

//5 GET
app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const Query5 = `SELECT match_id,
    match,year FROM
    player_match_score
   NATURAL JOIN 
    match_details 
    WHERE player_id=${playerId};
    `;
  const matches = await appDB.all(Query5);
  const forFunctioning = (every) => {
    return {
      matchId: every.match_id,
      match: every.match,
      year: every.year,
    };
  };

  response.send(matches.map((every) => forFunctioning(every)));
});

//6
app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const Query6 = `SELECT DISTINCT player_details.player_id,player_details.player_name FROM  player_details
    NATURAL JOIN 
    player_match_score;

    WHERE player_match_score.match_id=${matchId};
    `;
  const players = await appDB.all(Query6);
  const forFunctioning = (every) => {
    return {
      playerId: every.player_id,
      playerName: every.player_name,
    };
  };
  console.log(players);
  response.send(players.map((every) => forFunctioning(every)));
});

//7
app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const forLast = ` SELECT
    player_details.player_id AS playerId,
    player_details.player_name AS playerName,
    SUM(score) AS totalScore,
    SUM(fours) AS totalFours,
    SUM(sixes) AS totalSixes FROM 
    player_details INNER JOIN player_match_score ON
    player_details.player_id = player_match_score.player_id
    WHERE player_details.player_id = ${playerId};
    `;
  //const forLast = `
  //   SELECT
  // player_id,
  //   player_name,
  //   SUM(score),
  //   COUNT(fours),
  //   COUNT(sixes)
  //    FROM
  //   player_details NATURAL JOIN player_match_score
  // WHERE player_id=${playerId}`;
  const playerScores = await appDB.get(forLast);
  console.log(playerScores);
  response.send(playerScores);
});

module.exports = app;
