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
    const weather_url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m&daily=temperature_2m_max,temperature_2m_min,relative_humidity_2m_max,relative_humidity_2m_min,relative_humidity_2m_mean&timezone=Asia%2FKolkata`;

    const response = await fetch(weather_url);
    const respone_json = await response.json()
    const dailyWeather = respone_json["daily"];
    const currentWeather = respone_json["current"]
    const currentDateTime = new Date(currentWeather["time"])

    const current = {
        temp:currentWeather["temperature_2m"],
        temp_max:dailyWeather["temperature_2m_max"][0],
        temp_min:dailyWeather["temperature_2m_min"][0],
        humidity:dailyWeather["relative_humidity_2m_mean"][0],
        date:currentDateTime.toDateString(),
        time:currentDateTime.toLocaleTimeString()
    }

    //skip current day details on daily array
    const date = dailyWeather["time"].slice(1);
    const tempMax = dailyWeather["temperature_2m_max"].slice(1);
    const tempMin = dailyWeather["temperature_2m_min"].slice(1);
    const humidity = dailyWeather["relative_humidity_2m_mean"].slice(1);
    
    const daily = date.map((dateStr,index)=>({//returns an array of objects
        temp_max:tempMax[index],
        temp_min:tempMin[index],
        humidity:humidity[index],
        date: new Date(dateStr).toDateString()
    }))

    return {current:current, daily:daily};
}

const updateWeather = async(city="Bengaluru")=>{
    const weather_data = await fetchWeather(city);
    document.getElementById('Weather').innerText=weather_data["current"].temp;
}

//default city is Bengaluru
window.addEventListener("DOMContentLoaded", async () => {
    document.getElementById("city").value = "Bengaluru";
    await updateWeather();
});

const form = document.getElementById('weather-input');
form.addEventListener('submit',async (event)=>{
    event.preventDefault();

    const city = document.getElementById("city").value;
    await updateWeather(city);
})