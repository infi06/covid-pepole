const express = require("express");
const { open } = require("sqlite");
const path = require("path");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "covid19India.db");

let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB error:${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

//get state API
app.get("/states/", async (request, response) => {
  const getStateQuery = `
    SELECT *
    FROM state
    ORDER BY state_id`;
  const stateList = await db.all(getStateQuery);
  response.send(
    stateList.map((eachState) => ({
      stateId: eachState.state_id,
      stateName: eachState.state_name,
      population: eachState.population,
    }))
  );
});

//get movieId API
app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const getStateValueQuery = `
    SELECT *
    FROM 
    state
    WHERE state_id=${stateId};`;
  const stateList = await db.all(getStateValueQuery);
  response.send(
    stateList.map((eachState) => ({
      stateId: eachState.state_id,
      stateName: eachState.state_name,
      population: eachState.population,
    }))
  );
});

//post movie API

app.post("/districts/", async (request, response) => {
  const districtDetails = request.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = districtDetails;
  const addDistrictQuery = `INSERT INTO 
     district(district_name, state_id, cases, cured, active, deaths)
  VALUES (
      '${districtName}', ${stateId}, ${cases}, ${cured}, ${active}, ${deaths}
    );`;
  const dbResponse = await db.run(addDistrictQuery);
  console.log(dbResponse);
  response.send("District Successfully Added");
});

//get movieId API
app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const getDistrictValueQuery = `
    SELECT *
    FROM 
    district
    WHERE district_id=${districtId};`;
  const districtDetail = await db.all(getDistrictValueQuery);
  response.send(
    districtDetail.map((each) => ({
      districtId: each.district_id,
      districtName: each.district_name,
      stateId: each.state_id,
      cases: each.cases,
      cured: each.cured,
      active: each.active,
      deaths: each.deaths,
    }))
  );
});

//delete player API
app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;

  const deleteDistrictQuery = `
    DELETE FROM district
    WHERE 
      district_id = ${districtId};`;
  const districtDEl = await db.run(deleteDistrictQuery);
  response.send("District Removed");
});

//update player API

app.put("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const districtLatest = request.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = districtLatest;
  const updateDistrictQuery = `
    UPDATE district
    SET 
     district_name='${districtName}',
     state_id=${stateId},
     cases=${cases},
     cured=${cured},
     active=${active},
     deaths=${deaths}
     
    WHERE 
      district_id = ${districtId};`;
  const districtInform = await db.run(updateDistrictQuery);
  response.send("District Details Updated");
});
//get movieId API
app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;
  const getStateStatsQuery = `
    SELECT 
     SUM(cases),
     SUM(cured),
     SUM(active),
     SUM(deaths)
    FROM 
     district
    WHERE state_id=${stateId};`;
  const stats = await db.get(getStateStatsQuery);
  console.log(stats);
  response.send({
    totalCases: stats["SUM(cases)"],
    totalCured: stats["SUM(cured)"],
    totalActive: stats["SUM(active)"],
    totalDeaths: stats["SUM(deaths)"],
  });
});

// district get

app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;
  const getDistrictIdQuery = `
select state_id from district
where district_id = ${districtId};
`;
  const getDistrictIdQueryResponse = await database.get(getDistrictIdQuery);

  const getStateNameQuery = `
select state_name as stateName from state
where state_id = ${getDistrictIdQueryResponse.state_id};
`;
  const getStateNameQueryResponse = await database.get(getStateNameQuery);
  console.log(getStateNameQueryResponse);
  response.send(getStateNameQueryResponse);
});

module.exports = app;
