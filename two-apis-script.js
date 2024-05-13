// Julia Cable
// 10/22/23

let gameData;
let rainData;
let gameEntries = [];
let rainStats = [];
let minimumGoals = 0;

// table header from HMTL page saved so that the header is rebuilt upon generating new table info
const tableHeader = "<tr><th>Date</th><th>Home Team</th><th>Away Team</th><th>Home Team Score</th><th>Away Team Score</th><th>Millimeters of Precipitation</th></tr>";

getPenguinsData();
getRainData();
makeDefaultTable();

function getPenguinsData()
{
    const request = new XMLHttpRequest();
    
    //URL: Pittsburgh Penguins Games, 2021-2022
    let url = "https://statsapi.web.nhl.com/api/v1/schedule?startDate=2021-01-01&endDate=2022-12-31&hydrate=team%2Clinescore%2Cmetadata%2CseriesSummary%28series%29&teamId=5";
    
    request.open("GET", url, false);
    
    request.onload = function()
    {
        gameData = JSON.parse(this.response);

        if(request.status === 200)
        {
            gameData.dates.forEach
            (
                entry =>
                {
                    gameEntries.push(entry);
                }
            )
        }
        else
        {
            console.log("Error");
        }
    };
    request.send();
}



function getRainData()
{
    let dateString;
    const request = new XMLHttpRequest();
    
    // URL: precipitation info at Pittsburgh's latitude and longitude 2021-2022
    let url = "https://archive-api.open-meteo.com/v1/archive?latitude=40.4406&longitude=-79.995888&start_date=2021-01-01&end_date=2022-12-31&hourly=precipitation&timezone=America%2FNew_York";

    request.open("GET", url, false);
    
    request.onload = function()
    {
        rainData = JSON.parse(this.response);

        if(request.status === 200)
        {
            for(let j = 0; j<rainData.hourly.precipitation.length; j+=24) // outer loop, increments by 24 "hours" to move onto the next day
            {
                let sum = 0;
                for(let i = j; i<j+24; i++) // inner loop, counts mm of rain per hour over 24 hour period
                {
                    sum += rainData.hourly.precipitation[i];
                }
                
                dateString = "" + (rainData.hourly.time[j]).substring(0,10);  // get date by itself
                rainStats.push({date:dateString, mm:sum}); // save rain stats into objects of {date: mm of rain}
            }
        }
        else
        {
            console.log("Error");
        }
    };
    request.send();
}


function makeDefaultTable()
{
    document.querySelector("#displayTable").innerHTML = tableHeader;
    
    let tableRow;
    let tableDate;
    let tableHome;
    let tableAway;
    let tablePoints;
    let tableAwayPoints;
    let tableMM;
    let dateIndex = 0;  // to help match the game date with the rain stats date

    gameEntries.forEach(
        gameEntry =>
        {
            while(!(gameEntry.date === rainStats[dateIndex].date))
            {
                // increment to the next date for rain stats until it matches a game day
                dateIndex++;
            }
                tableRow = document.createElement("tr");

                tableDate = document.createElement("td");
                tableHome = document.createElement("td");
                tableAway = document.createElement("td");
                tablePoints = document.createElement("td");
                tableAwayPoints = document.createElement("td");
                tableMM = document.createElement("td");
                
                tableDate.appendChild(document.createTextNode(gameEntry.date));
                tableHome.appendChild(document.createTextNode(gameEntry.games[0].teams.home.team.name));
                tableAway.appendChild(document.createTextNode(gameEntry.games[0].teams.away.team.name));
                tablePoints.appendChild(document.createTextNode(gameEntry.games[0].teams.home.score));
                tableAwayPoints.appendChild(document.createTextNode(gameEntry.games[0].teams.away.score));
        
                // toFixed function rounds to wanted number of decimal places
                // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toFixed 
                tableMM.appendChild(document.createTextNode(rainStats[dateIndex].mm.toFixed(2)));
                
                tableRow.appendChild(tableDate);
                tableRow.appendChild(tableHome);
                tableRow.appendChild(tableAway);
                tableRow.appendChild(tablePoints);
                tableRow.appendChild(tableAwayPoints);
                tableRow.appendChild(tableMM);

                document.querySelector("#displayTable").appendChild(tableRow);
            
        }
    ) 
}


function tableByYear()
{
    document.querySelector("#displayTable").innerHTML = tableHeader;
    minimumGoals = document.querySelector("#numTotalGoals").value;

    let tableRow;
    let tableDate;
    let tableHome;
    let tableAway;
    let tablePoints;
    let tableAwayPoints;
    let tableMM;
    let dateIndex = 0;
    let yearString;

    gameEntries.forEach(
        gameEntry =>
        {
            if(document.querySelector("#year21").checked)
                yearString = "2021";
            else if(document.querySelector("#year22").checked)
                yearString = "2022";
            
            if(gameEntry.date.substring(0,4) === yearString || document.querySelector("#yearBoth").checked) //ensures date matches OR 2021-2022 is selected
            {
                while(!(gameEntry.date === rainStats[dateIndex].date))
                {
                    dateIndex++;
                }
                
                tableRow = document.createElement("tr");

                tableDate = document.createElement("td");
                tableHome = document.createElement("td");
                tableAway = document.createElement("td");
                tablePoints = document.createElement("td");
                tableAwayPoints = document.createElement("td");
                tableMM = document.createElement("td");
                
                tableDate.appendChild(document.createTextNode(gameEntry.date));
                tableHome.appendChild(document.createTextNode(gameEntry.games[0].teams.home.team.name));
                tableAway.appendChild(document.createTextNode(gameEntry.games[0].teams.away.team.name));
                tablePoints.appendChild(document.createTextNode(gameEntry.games[0].teams.home.score));
                tableAwayPoints.appendChild(document.createTextNode(gameEntry.games[0].teams.away.score));
                tableMM.appendChild(document.createTextNode(rainStats[dateIndex].mm.toFixed(2)));
                
                tableRow.appendChild(tableDate);
                tableRow.appendChild(tableHome);
                tableRow.appendChild(tableAway);
                tableRow.appendChild(tablePoints);
                tableRow.appendChild(tableAwayPoints);
                tableRow.appendChild(tableMM);

                // only adds row to table if minimum goal condition is met
                if(gameEntry.games[0].teams.home.score  +  gameEntry.games[0].teams.away.score  >= minimumGoals)
                    document.querySelector("#displayTable").appendChild(tableRow);
            }
        }
    ) 
}


function pageColor()
{
    if(document.querySelector("#blue").checked && document.querySelector("#yellow").checked)
    {
        document.body.style.backgroundColor = "lightgreen";
    }
    else if(document.querySelector("#blue").checked)
    {
        document.body.style.backgroundColor = "lightblue";
    }
    else if(document.querySelector("#yellow").checked)
    {
        document.body.style.backgroundColor = "#f3fa6e"; // hex code for pale yellow
    }
    else
    {
        document.body.style.backgroundColor = "white";
    }
}