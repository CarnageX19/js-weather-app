const getWeatherCondition = (code)=>{
    const weatherCodeDescriptions = {
        0: "Clear sky",
        1: "Mainly clear",
        2: "Partly cloudy",
        3: "Overcast",
        45: "Fog",
        48: "Depositing rime fog",
        51: "Light drizzle",
        53: "Moderate drizzle",
        55: "Dense drizzle",
        61: "Slight rain",
        63: "Moderate rain",
        65: "Heavy rain",
        71: "Slight snow fall",
        73: "Moderate snow fall",
        75: "Heavy snow fall",
        95: "Thunderstorm",
        96: "Thunderstorm with hail",
        99: "Thunderstorm with heavy hail",
        56: "Light Freezing Drizzle",
        57: "Heavy Freezing Drizzle",
        66: "Light Freezing Rain",
        67: "Heavy Freezing Rain",
        77: "Snow Grains",
        80: "Slight Rain Showers",
        81: "Moderate Rain Showers",
        82: "Violent Rain Showers",
        85: "Light Snow Showers",
        86: "Heavy Snow Showers",
      };
      
      return weatherCodeDescriptions[code];
}


const fetchCityImage = async(city='Bengaluru')=>{
    return imageUrl = await fetch(`http://localhost:3000/photos?city=${city}`)
}

const getLocation = async(city)=>{
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${city}`;

    try {
        const response = await fetch(url);
        const response_json = await response.json();
        const latitude = response_json["results"][0]["latitude"];
        const longitude = response_json["results"][0]["longitude"]

        return [latitude,longitude]

    } catch (error) {
        console.error(`Error in fetching city location ${error}`)
    }
}

const fetchWeather = async(city) => {
    const [lat, lon] = await getLocation(city);
    const weather_url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m&daily=temperature_2m_max,temperature_2m_min,relative_humidity_2m_max,relative_humidity_2m_min,relative_humidity_2m_mean,weathercode&timezone=auto`;

    const response = await fetch(weather_url);
    const respone_json = await response.json()

    const dailyWeather = respone_json["daily"];
    const currentWeather = respone_json["current"];
    const currentDateTime = new Date(currentWeather["time"]);

    const imageResponse = await fetchCityImage(city);
    const imageUrl  = await imageResponse.text()

    const ampm = currentDateTime.toLocaleTimeString().split(" ")[1]
    const bg_url = ampm=='PM'? "assets/night.png" : "assets/day.png";

    const date_array = currentDateTime.toDateString().split(" ").slice(0,3);
    const currDate = `${date_array[0]}, ${date_array[1]} ${date_array[2]}`;

    const current = {
        temp:currentWeather["temperature_2m"],
        temp_max:dailyWeather["temperature_2m_max"][0],
        temp_min:dailyWeather["temperature_2m_min"][0],
        humidity:dailyWeather["relative_humidity_2m_mean"][0],
        weather_condition:getWeatherCondition(dailyWeather["weathercode"][0]),
        date:currDate,
        time:currentDateTime.toLocaleTimeString(),
        image:imageUrl,
        background:bg_url,
        ampm:ampm
    }

    //skip current day details on daily array
    const date = dailyWeather["time"].slice(1);
    const tempMax = dailyWeather["temperature_2m_max"].slice(1);
    const tempMin = dailyWeather["temperature_2m_min"].slice(1);
    const humidity = dailyWeather["relative_humidity_2m_mean"].slice(1);
    const weather_condition = dailyWeather["weathercode"].slice(1);
    
    const daily = date.map((dateStr,index)=>({//returns an array of objects
        temp_max:tempMax[index],
        temp_min:tempMin[index],
        humidity:humidity[index],
        weather_condition:getWeatherCondition(weather_condition[index]),
        week: new Date(dateStr).toLocaleDateString('en-US',{weekday:'long'})
    }))
    return {current:current, daily:daily};
}

const displayWeather = async(city="Kolkata")=>{
    const weather_data = await fetchWeather(city);
    const current = weather_data.current;

    const timeIcon = current.ampm == 'PM' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';

    document.getElementById("cityName").textContent = `${city}`;
    document.getElementById("temp").textContent = `${current.temp} °C`;
    document.getElementById("maxMin").innerHTML = `<i class="fas fa-arrow-up"></i> ${current.temp_max} <i class="fas fa-arrow-down"></i> ${current.temp_min} °C`;
    document.getElementById("weatherCondition").textContent = current.weather_condition;
    document.getElementById("humidity").innerHTML = `<i class="fas fa-droplet"></i> ${current.humidity}% Humidity`;
    document.getElementById("date").innerHTML = `<i class="fa-solid fa-calendar-days"></i> ${current.date}`;
    document.getElementById("time").innerHTML = `${timeIcon}  ${current.time}`;
    document.getElementById("weatherIcon").src = `assets/${current.weather_condition}.png`;
    document.querySelector("#Weather").style.backgroundImage = `url(${current.image})`;
    document.querySelector("body").style.backgroundImage = `url(${current.background})`;

    console.log(weather_data.daily)
    document.getElementById("daily-weather").innerHTML='';
    weather_data.daily.map((details,index)=>(
        document.getElementById("daily-weather").innerHTML+=`
            <div class='daily-weather-details'>
                <p class='dailyWeek'${index}> ${details.week} </p>
                <img src='assets/${details.weather_condition}.png' class='daily-weather-icon'>
                <p class='daily-weather-condition'>${details.weather_condition} </p>
                <p class='dailyMaxMin'><i class="fas fa-arrow-up"></i> ${details.temp_max} <i class="fas fa-arrow-down"></i> ${details.temp_min} </p>
                <p class='dailyHumidity'> <i class="fas fa-droplet"></i> ${details.humidity}%</p>
            </div>
        `)
    )
}

window.addEventListener("DOMContentLoaded", async () => {
    await displayWeather();
});

const form = document.getElementById('weather-input');
form.addEventListener('submit',async (event)=>{
    event.preventDefault();

    const city = document.getElementById("city").value;
    await displayWeather(city);
})