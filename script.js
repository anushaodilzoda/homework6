const tempEl = document.querySelector(".temperature-value");
const humidityEl = document.querySelector(".humidity");
const windSpeedEl = document.querySelector(".wind-speed");
const uvIndexEl = document.querySelector(".uv-index");
const dateEl = document.querySelector(".date");
const searchEl = document.querySelector(".form-control")

$(".form-control").on("click", function(event) {
   


        event.preventDefault();

        const search = $(".form-control").val();

        const queryURL = "api.openweathermap.org/data/2.5/weather?" + country + "&apikey=9f76765dd7ced6b45e634e327c2f5557";

     

        $.ajax({
          url: queryURL,
          method: "GET"
        }).then(function(response) {
          $(".form-control").text(JSON.stringify(response));
        });
