var apiKey = "bf3ebaf8062d33b3f5c497c88e890250";
var city = document.getElementById("city")
var currentDate = moment().format("DD/MM/YYYY")
city.value = "";
var responseContainer = document.querySelector("#current-city");
var searchHistoryContainer = document.getElementById("search-history")
var forecastContainer = document.getElementById("forecast")
var cityTempDiv = document.createElement('div');
var cityDetailsDiv = document.createElement('div');
var cityNameEl = document.createElement("div");
var currentTempEl = document.createElement("div");
var humidityEl = document.createElement("div");
var windEl = document.createElement("div");
var uvIndexContainer = document.createElement("div");
var uvIndexEl = document.createElement("div");
var uvValueDisplay = document.createElement("div");
var forecastEl = document.createElement("div")


function fetchWeather() {
    var weatherApi = "https://api.openweathermap.org/data/2.5/weather?q=" + city.value + "&units=metric&appid=" + apiKey;

    // fetchs the data from "Open Weather" API
    fetch(weatherApi)
        .then(function (response) {
            if (!response || !response.ok) {
                throw new Error('There was an error');
            };
            return response.json();
        })
        .then(function (response) {
            // div to contain city name and current temperature
            cityTempDiv.classList = 'temp-div';
            responseContainer.appendChild(cityTempDiv);

            // div to contain other details - humidity, wind speed, UV index
            cityDetailsDiv.classList = 'detail-div';
            responseContainer.appendChild(cityDetailsDiv);

            cityNameEl.innerHTML = "<p class='city-title'><span>" + response.name + " "
                + "(" + currentDate + ")"
                + "<img class='current-icon' src='http://openweathermap.org/img/w/" + response.weather[0].icon
                + ".png' alt=Current weather icon/></p>";
            cityTempDiv.appendChild(cityNameEl);

            currentTempEl.innerHTML = "<p>Temp:<span>" + " " + Math.round(response.main.temp) + "&#176C</span></p>";
            cityTempDiv.appendChild(currentTempEl);

            humidityEl.innerHTML = "<p>Humidity:<span>" + " " + response.main.humidity + "%</span></p>";
            cityDetailsDiv.appendChild(humidityEl);

            windEl.innerHTML = "<p>Wind Speed:<span>" + " " + Math.round(response.wind.speed) + " KM/H</span></p>";
            cityDetailsDiv.appendChild(windEl);

            var uviAPI = "https://api.openweathermap.org/data/2.5/onecall?appid=c83c5006fffeb4aa44a34ffd6a27f135&lat=" + response.coord.lat + "&lon=" + response.coord.lon;
            fetch(uviAPI)
                .then(function (uviResponse) {
                    if (!uviResponse || !uviResponse.ok) {
                        throw new Error('There was an error');
                    };
                    return uviResponse.json();
                })
                .then(function (uviResponse) {
                    cityDetailsDiv.appendChild(uvIndexContainer);
                    var uvValue = uviResponse.current.uvi;
                    uvIndexContainer.appendChild(uvIndexEl);
                    uvIndexContainer.appendChild(uvValueDisplay);
                    if (uvValue > 8) {
                        uvIndexEl.innerHTML = "UV Index: " + "<a style='background-color: red; padding: 10px;'>" + uvValue + "</a>";
                    } else if (uvValue >= 5 && uvValue <= 8) {
                        uvIndexEl.innerHTML = "UV Index: " + "<a style='background-color: orange; padding: 10px;'>" + uvValue + "</a>";
                    } else if (uvValue >= 3 && uvValue <= 5) {
                        uvIndexEl.innerHTML = "UV Index: " + "<a style='background-color: yellow; padding: 10px;'>" + uvValue + "</a>";
                    } else if (uvValue < 3) {
                        uvIndexEl.innerHTML = "UV Index: " + "<a style='background-color: green; padding: 10px;'>" + uvValue + "</a>";
                    }
                    return fetch("https://api.openweathermap.org/data/2.5/onecall?lat=" + uviResponse.lat + "&lon=" + uviResponse.lon + "&appid=c83c5006fffeb4aa44a34ffd6a27f135&units=metric");
                })
                .then(function (forecastResponse) {
                    return forecastResponse.json();
                })
                .then(function (forecastResponse) {

                    var forecastHeadingEl = document.getElementById("forecast-heading")
                    forecastHeadingEl.innerHTML = "5-Day Forecast:"

                    for (var i = 1; i < 6; i++) {
                        var forecastEl = document.createElement("div");
                        forecastEl.classList = "forecast-card";
                        forecastContainer.appendChild(forecastEl);

                        var dateDiv = document.createElement("div");
                        dateDiv.classList = "card-title";
                        var forecastDate = moment(forecastResponse.daily[i].dt * 1000).format("DD/MM/YYYY");
                        dateDiv.innerHTML = "<p>" + forecastDate + "</p>";
                        forecastEl.appendChild(dateDiv);

                        var iconDiv = document.createElement("div");
                        iconDiv.innerHTML = "<img class='forecast-icon' src='http://openweathermap.org/img/w/" + forecastResponse.daily[i].weather[0].icon + ".png' class='forecast-icon' alt=Current weather icon/>";
                        forecastEl.appendChild(iconDiv);

                        var tempDiv = document.createElement("div");
                        tempDiv.classList = "card-text";
                        tempDiv.innerHTML = "<p>Temp:<span>" + " " + Math.round(forecastResponse.daily[i].temp.day) + "&#176C</span></p>";
                        forecastEl.appendChild(tempDiv);

                        var speedDiv = document.createElement("div");
                        speedDiv.classList = "card-text";
                        speedDiv.innerHTML = "<p>Wind:<span>" + " " + forecastResponse.daily[i].wind_speed + " KM/H</span></p>";
                        forecastEl.appendChild(speedDiv);

                        var humidDiv = document.createElement("div");
                        humidDiv.classList = "card-text";
                        humidDiv.innerHTML = "<p>Humidity:<span>" + " " + forecastResponse.daily[i].humidity + "%</span></p>";
                        forecastEl.appendChild(humidDiv);
                    }
                })
                .catch(function (error) {
                    alert(error.message);
                    document.getElementById("search-bar").value = "";
                    return;
                });
        })
};

//function to create the list of weather searches
function createSearchList() {
    var citySearch = document.createElement("button");
    citySearch.innerHTML = city.value.trim().toUpperCase();
    citySearch.classList = "search-results";
    searchHistoryContainer.prepend(citySearch);
};

//function to store the city name in local storage
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
    currentTempEl.remove();
    humidityEl.remove();
    windEl.remove();
    forecastContainer.remove()
}


document.getElementById("delete").addEventListener('click', function (event) {
    event.preventDefault();
    searchHistoryContainer.remove();
    localStorage.clear("searchedCities");
    removePreviousCity();
    location.reload();
});


document.getElementById("search").addEventListener('click', function (event) {
    event.preventDefault();
    fetchWeather();
    createSearchList();
    storeSearchHistory();
});