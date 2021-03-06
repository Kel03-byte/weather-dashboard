var apiKey = "bf3ebaf8062d33b3f5c497c88e890250";
var city = document.getElementById("city") //City input area
var currentDate = moment().format("DD/MM/YYYY") //Current Date
city.value = "";
var responseContainer = document.querySelector("#current-city"); //Current Weather Display Container
var searchHistoryContainer = document.getElementById("search-history")  //Search History Container
var forecastContainer = document.getElementById("forecast") //5-Day forecast container

//Creates and labels a div element to each section so each of the Weather details can be displayed in each div
var cityTempDiv = document.createElement('div');
var cityDetailsDiv = document.createElement('div');
var cityNameEl = document.createElement("div");
var currentTempEl = document.createElement("div");
var humidityEl = document.createElement("div");
var windEl = document.createElement("div");
var uvIndexContainer = document.createElement("div");
var uvIndexEl = document.createElement("div");
var uvValueDisplay = document.createElement("div");
var forecastElement = document.createElement("div")


function fetchWeather() {
    var weatherApi = "https://api.openweathermap.org/data/2.5/weather?q=" + city.value + "&units=metric&appid=" + apiKey;

    // fetchs the data from "Open Weather" API
    fetch(weatherApi)
        .then(function (response) {
            if (!response || !response.ok) {
                throw new Error('There was an error with OpenWeather Api');
            };
            return response.json();
        })
        .then(function (response) {
            // div to contain city name and current temperature
            cityTempDiv.classList = 'temp-div';
            responseContainer.appendChild(cityTempDiv);

            // div to contain other details - humidity and wind speed
            cityDetailsDiv.classList = 'detail-div';
            responseContainer.appendChild(cityDetailsDiv);

            cityNameEl.innerHTML = "<p class='city-title'><span>" + response.name + " "
                + "(" + currentDate + ")"
                + "<img class='current-icon' src='https://s3-us-west-2.amazonaws.com/s.cdpn.io/162656/" + response.weather[0].icon
                + ".svg' alt=Current weather icon/></p>";
            cityTempDiv.appendChild(cityNameEl);

            currentTempEl.innerHTML = "<p>Temp:<span>" + " " + Math.round(response.main.temp) + "&#176C</span></p>";
            cityTempDiv.appendChild(currentTempEl);

            humidityEl.innerHTML = "<p>Humidity:<span>" + " " + response.main.humidity + "%</span></p>";
            cityDetailsDiv.appendChild(humidityEl);

            windEl.innerHTML = "<p>Wind Speed:<span>" + " " + Math.round(response.wind.speed) + " KM/H</span></p>";
            cityDetailsDiv.appendChild(windEl);

            //Fetchs the OneCall API to help create the UV Index and the 5-Day forecast
            var uviApi = "https://api.openweathermap.org/data/2.5/onecall?appid=c83c5006fffeb4aa44a34ffd6a27f135&lat=" + response.coord.lat + "&lon=" + response.coord.lon + "&units=metric&appid=" + apiKey;
            fetch(uviApi)
                .then(function (uviResponse) {
                    if (!uviResponse || !uviResponse.ok) {
                        throw new Error('There was an error with OneCall Api');
                    };
                    return uviResponse.json();
                })
 
                //Displays the UV Index and colours the background to match the threat level
                .then(function (uviResponse) {
                    cityDetailsDiv.appendChild(uvIndexContainer);
                    var uvValue = uviResponse.current.uvi;
                    uvIndexContainer.appendChild(uvIndexEl);
                    uvIndexContainer.appendChild(uvValueDisplay);
                    if (uvValue > 8) {
                        uvIndexEl.innerHTML = "UV Index: " + "<a class='danger'>" + uvValue + "</a>";
                    } else if (uvValue >= 5 && uvValue <= 8) {
                        uvIndexEl.innerHTML = "UV Index: " + "<a class='warning'>" + uvValue + "</a>";
                    } else if (uvValue >= 3 && uvValue <= 5) {
                        uvIndexEl.innerHTML = "UV Index: " + "<a class='moderate'>" + uvValue + "</a>";
                    } else if (uvValue < 3) {
                        uvIndexEl.innerHTML = "UV Index: " + "<a class='low'>" + uvValue + "</a>";
                    }

                    //Builds and displays the 5-Day forecast
                    for (var i = 1; i < 6; i++) {
                        var forecastElement = document.createElement("div");
                        forecastElement.classList = "forecast-card";
                        forecastContainer.appendChild(forecastElement);

                        var dateDiv = document.createElement("div");
                        dateDiv.classList = "card-title";
                        var forecastDate = moment(uviResponse.daily[i].dt * 1000).format("DD/MM/YYYY");
                        dateDiv.innerHTML = "<p>" + forecastDate + "</p>";
                        forecastElement.appendChild(dateDiv);

                        var iconDiv = document.createElement("div");
                        iconDiv.innerHTML = "<img class='forecast-icon' src='https://s3-us-west-2.amazonaws.com/s.cdpn.io/162656/" + uviResponse.daily[i].weather[0].icon + ".svg' class='forecast-icon' alt=Current weather icon/>";
                        forecastElement.appendChild(iconDiv);

                        var tempDiv = document.createElement("div");
                        tempDiv.classList = "card-text";
                        tempDiv.innerHTML = "<p>Temp:<span>" + " " + Math.round(uviResponse.daily[i].temp.day) + "&#176C</span></p>";
                        forecastElement.appendChild(tempDiv);

                        var speedDiv = document.createElement("div");
                        speedDiv.classList = "card-text";
                        speedDiv.innerHTML = "<p>Wind:<span>" + " " + Math.round(uviResponse.daily[i].wind_speed) + " KM/H</span></p>";
                        forecastElement.appendChild(speedDiv);

                        var humidDiv = document.createElement("div");
                        humidDiv.classList = "card-text";
                        humidDiv.innerHTML = "<p>Humidity:<span>" + " " + uviResponse.daily[i].humidity + "%</span></p>";
                        forecastElement.appendChild(humidDiv);
                    }
                })
        })

        //Catches any errors with getting the two URL's
        .catch(function (error) {
            alert(error.message);
            document.getElementById("search-bar").value = "";
            return;
        });
};

//Function to create the list of weather searches
function createSearchList() {
    var citySearch = document.createElement("button");
    citySearch.innerHTML = city.value.trim().toUpperCase();
    citySearch.classList = "search-results";
    searchHistoryContainer.prepend(citySearch);
};

//Function to store the city name in local storage
function storeSearchHistory() {
    var userSearch = city.value.trim().toUpperCase();
    if (!userSearch) {
        return;
    };
    var previousSearchCity = JSON.parse(localStorage.getItem("searchedCities")) || [];
    previousSearchCity.push(userSearch);
    localStorage.setItem("searchedCities", JSON.stringify(previousSearchCity));
    city.value = "";
};

//function to clear the previous weather search
function removePreviousCity() {
    cityNameEl.remove();
    uvIndexContainer.remove();
    forecastContainer.innerHTML = "";
    currentTempEl.remove();
    humidityEl.remove();
    windEl.remove();
};

//Event to delete the search history
document.getElementById("delete").addEventListener('click', function (event) {
    removePreviousCity();
    searchHistoryContainer.remove();
    localStorage.clear("searchedCities");
    location.reload();
});

//Event to get the Weather Info
document.getElementById("search").addEventListener('click', function (event) {
    if (!city.value) {
        alert("Please enter a city name")
    } else {
        removePreviousCity()
        fetchWeather();
        createSearchList();
        storeSearchHistory();
    }
});