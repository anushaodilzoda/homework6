$(document).ready(function () {
  console.log("ready!");
  const apiKey = "42289ea57481ffa0e2b1aa22ae9c2d55";
  const apiCall = "https://api.openweathermap.org/data/2.5/";
  var weatherSearches = [];
  var lastSearch;
  var currentWeatherHeaderEl = $("#currentWeatherHeader");
  var currentWeatherTempEl = $("#currentWeatherTemp");
  var currentWeatherHumEl = $("#currentWeatherHum");
  var currentWeatherWindEl = $("#currentWeatherWind");
  var currentWeatherUVEl = $("#currentWeatherUV");
  var forecastWeatherDivEl = $("#forecastWeatherDiv");


  // this function loads the weatherSearches and lastSearch variables
  function loadWeatherSearches() {
      var value = localStorage.getItem("weatherSearches");
      if (value !== null) {
          console.log(value);
          var localWS = JSON.parse(value);
          if (localWS !== null) {
              weatherSearches = localWS;
          }
      }
      var value = localStorage.getItem("lastWeatherSearch");
      if (value !== null) {
          console.log(value);
          lastSearch = value;
      }
  }
  loadWeatherSearches();
  console.log(weatherSearches);

  //if there's a Last Search use it and show the weather for that location, otherwise see if we can find the current location
  if (lastSearch != null) {
      console.log("last search: " + lastSearch);
      //remove the double quotes 
      var lastSearchNoQuotes = lastSearch.replace(/['"]+/g, '');
      console.log(lastSearchNoQuotes);
      getWeather(lastSearchNoQuotes);
  }
  else {
      //if there's no Last Search in the storage, and if we can get the current location then show the weather for the current location.
      navigator.geolocation.getCurrentPosition(function (location) {      
       
          getWeatherByCoords(location.coords.longitude, location.coords.latitude);
          
      });
  }


  var btnDiv = $("#recentSearches");
  //this function clears the Search buttons area and re load it per updated weatherSearches
  function renderButtons() {
      btnDiv.html("");
      weatherSearches.forEach(element => {
          var btn = $("<button>");
          btn.addClass("btn btn-warning mx-3 btn-block");
          btn.html(element);
          btnDiv.append(btn);
          btn.click(function (event) {
            $("#searchText").empty();
              var city = $(this).html();
              console.log("Button Click: " + city);
              getWeather(city);              
          });
      });
  }
  renderButtons();

  //this function retrieves the UV data for the current response/location.
  function getUV(response) {
      //http://api.openweathermap.org/data/2.5/uvi?appid={appid}&lat={lat}&lon={lon}
      queryURL = apiCall + "uvi?APPID=" + apiKey + "&lat=" + response.coord.lat + "&lon=" + response.coord.lon;
      console.log(queryURL);
      $.ajax({
          url: queryURL,
          method: "GET"
      }).done(function (response) {          
        currentWeatherUV.innerHTML   = "UV : " + response.value;

                 // Changes background color based on danger of UV levels
                 if (response.value <= 2) {
                    currentWeatherUV.setAttribute("style", "background-color: #8DE760 ");
                    
                } else if (response.value > 2 && response.value <= 5) {
                    currentWeatherUV.setAttribute("style", "background-color: #E4F06E ");
                    
                } else if (response.value >= 5 && response.value <= 8) {
                    currentWeatherUV.setAttribute("style", "background-color: #EBAC57 ");
                    
                } else if (response.value >= 8) {
                    currentWeatherUV.setAttribute("style", "background-color: #F34343 ");
                    
                }
      
      });
   
}

  

  //Clears the current weather section.
  function clearWeatherData() {
      currentWeatherHeaderEl.html("City/Date : Loading...");
      currentWeatherTempEl.html("Temperature : ");
      currentWeatherHumEl.html("Humidity : ");
      currentWeatherWindEl.html("Wind Speed : ");
      currentWeatherUVEl.html("UV : ");
  }

  //Creates the url for the icon that is returned in the response.
  function getImagePath(response) {
      return "https://openweathermap.org/img/wn/" + response.weather[0].icon + "@2x.png";
  }

  function renderCard(response, headerEl, TempEl, HumEl, WindEl, headerHtml) {
      headerEl.html(headerHtml);
      var imgPath = getImagePath(response);
      headerEl.append('<img id="currentImg" src="' + imgPath + '" height="42" width="42" />')
      TempEl.html("Temperature: " + Math.round(response.main.temp) + " &#8451");
      HumEl.html("Humidity: " + Math.round(response.main.humidity) + "%");
      WindEl.html("Wind  : " + Math.round(response.wind.speed) + " KPH");
  }

  //Shows the input weather data on the page.
  function showWeatherData(response) {
      renderCard(response, currentWeatherHeaderEl, currentWeatherTempEl, currentWeatherHumEl, currentWeatherWindEl, response.name + " - " + moment().format("ddd, MMM Do, h:mm a") + "");
      getUV(response);
  }

  //Retrieves the current weather data for the input coordinates and then shows the data on the page.
  function getWeatherByCoords(lon, lat) {
      // weather?lat=35&lon=139&appid
      clearWeatherData();
      // &units=metric
      queryURL = apiCall + "weather?lat=" + lat + "&lon=" + lon + "&units=metric" + "&APPID=" + apiKey;
      console.log(queryURL);
      $.ajax({
          url: queryURL,
          method: "GET"
      }).done(function (response) {
          console.log(response);
          showWeatherData(response);
          getForecast(response.id);

      }).fail(function (response) {
          console.log(response.responseJSON.message);
          $("#searchMsg").html(response.responseJSON.message);
      });
  }

  // Checks if txt exists in the weatherSearches array. this function is case insensitive
  function weatherSearchesInclude(txt) {
      console.log("checking weatherSearches for:" + txt);
      var found = false;
      var lowerTxt = txt.toLowerCase();
      console.log("checking weatherSearches for:" + lowerTxt);
      for (var i = 0; i < weatherSearches.length; i++) {
          console.log(weatherSearches[i].toLowerCase());
          if (weatherSearches[i].toLowerCase() === lowerTxt) {
              console.log("Found");
              found = true;
              break;
          }
          
      }
      return found;
  }

  //Retrieves the current weather data for the input city and then shows the data on the page.
  function getWeather(txt) {
      if (txt !== "") {
          clearWeatherData();
          // &units=metric
          queryURL = apiCall + "weather?q=" + txt + "&units=metric" + "&APPID=" + apiKey;
          console.log(queryURL);
          $.ajax({
              url: queryURL,
              method: "GET"
          }).done(function (response) {
              console.log(response);
              showWeatherData(response);
              lastSearch = txt;
              localStorage.setItem("lastWeatherSearch", JSON.stringify(lastSearch));
              if (!weatherSearchesInclude(txt)) {
                  weatherSearches.push(txt);
                  weatherSearches.sort();
                  localStorage.setItem("weatherSearches", JSON.stringify(weatherSearches));
                  renderButtons();
              }

              getForecast(response.id);

          }).fail(function (response) {
              console.log(response.responseJSON.message);
              $("#searchMsg").html(response.responseJSON.message);
          });
      }
  }

  // The API returns 5 days forecast and up to 8 objects for each day (one per hour) i.e. 40 objects are in the response. 
  
  function getForeCastForData(date, response) {
      var forecastList = [];
      response.list.forEach(function (element) {
          // Create a new JavaScript Date object based on the timestamp
          // multiplied by 1000 so that the argument is in milliseconds, not seconds.
          var dt = new Date(element.dt * 1000);
          if (date == moment(dt).format("MM-DD-YYYY")) {
              forecastList.push(element);
          }
      });
      var forecastMid = forecastList[Math.floor(forecastList.length / 2)];
      return forecastMid;
  }

  //Shows the input forecast on the page. It dynamically adds cards.
  function showWeatherForecast(response) {
      forecastWeatherDivEl.html("");
      var forecastDate = [];
      var today = moment();
      for (var i = 0; i < 5; i++) {
          // console.log(i);
          var dt = today.add(1, 'd');
          var dtString = today.format("MM-DD-YYYY");
          console.log(dtString);
          var forecastData = getForeCastForData(dtString, response);
          console.log(forecastData);
          var col = $("<div>");
          col.addClass("col");
          col.appendTo(forecastWeatherDivEl);
          // col.html("test");
          var card = $("<div>");
          card.addClass("card text-white bg-primary my-2 ")
          card.appendTo(col);
          // card.html("test");
          var headerEl = $("<div>");
          headerEl.addClass("card-header");
          headerEl.html(dtString);
          headerEl.appendTo(card);

          var cardBody = $("<div>");
          cardBody.addClass("card-body");
          cardBody.appendTo(card);
          var tempEl = $("<p>");
          tempEl.html("Temp:");
          tempEl.addClass("card-text");
          tempEl.appendTo(cardBody);
          var humEl = $("<p>");

          humEl.html("Humidity:");
          humEl.addClass("card-text");
          humEl.appendTo(cardBody);
          var windEl = $("<p>");
          windEl.html("Wind Speed:");
          windEl.addClass("card-text");
          windEl.appendTo(cardBody);
          console.log(forecastData);
          renderCard(forecastData, headerEl, tempEl, humEl, windEl, dtString);

      }
  }

  //Retrieves the forecast for the input ID.
  function getForecast(cityID) {
      // api.openweathermap.org/data/2.5/forecast?id={city ID}
      // clearForecastData();
      // &units=metric
      queryURL = apiCall + "forecast?id=" + cityID + "&units=metric" + "&APPID=" + apiKey;
      console.log(queryURL);
      $.ajax({
          url: queryURL,
          method: "GET"
      }).done(function (response) {
          console.log("Forecast");
          console.log(response);
          showWeatherForecast(response);
      }).fail(function (response) {
          console.log(response.responseJSON.message);
          // $("#searchMsg").html(response.responseJSON.message);
      });
  }

  //Handles the search button click event
  $("#searchBtn").click(function (event) {    
      event.preventDefault();
      var txt = $("#searchText").val();
      txt = txt.trim();
      getWeather(txt);
      
      
  });

  // clears  localStorage
    $("#clearSearches").click(function(){
      $("#recentSearches").empty();
      $(localStorage.clear());
    });

});


 
