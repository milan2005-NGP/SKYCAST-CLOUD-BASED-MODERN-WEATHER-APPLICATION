const cityInput = document.getElementById('city-input');
const cityNameEl = document.getElementById('city-name');
const dateEl = document.getElementById('current-date');
const tempEl = document.getElementById('current-temp');
const conditionEl = document.getElementById('current-condition');
const iconEl = document.getElementById('current-icon');
const highLowEl = document.getElementById('high-low');

const windEl = document.getElementById('wind-speed');
const humidityEl = document.getElementById('humidity');
const uvEl = document.getElementById('uv-index');
const visibilityEl = document.getElementById('visibility');
const forecastContainer = document.getElementById('forecast-container');

// WMO Weather interpretation codes
function getWeatherDetails(code) {
    const weatherCodes = {
        0: { text: "Clear Sky", icon: "fa-sun" },
        1: { text: "Mainly Clear", icon: "fa-sun" },
        2: { text: "Partly Cloudy", icon: "fa-cloud-sun" },
        3: { text: "Overcast", icon: "fa-cloud" },
        45: { text: "Fog", icon: "fa-smog" },
        48: { text: "Depositing Rime Fog", icon: "fa-smog" },
        51: { text: "Light Drizzle", icon: "fa-cloud-rain" },
        53: { text: "Moderate Drizzle", icon: "fa-cloud-rain" },
        55: { text: "Dense Drizzle", icon: "fa-cloud-rain" },
        61: { text: "Slight Rain", icon: "fa-cloud-showers-heavy" },
        63: { text: "Moderate Rain", icon: "fa-cloud-showers-heavy" },
        65: { text: "Heavy Rain", icon: "fa-cloud-showers-heavy" },
        71: { text: "Slight Snow", icon: "fa-snowflake" },
        73: { text: "Moderate Snow", icon: "fa-snowflake" },
        75: { text: "Heavy Snow", icon: "fa-snowflake" },
        95: { text: "Thunderstorm", icon: "fa-bolt" }
    };
    return weatherCodes[code] || { text: "Unknown", icon: "fa-cloud" };
}

// Format Date
function formatDate(dateString) {
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function getShortDay(dateString) {
    const options = { weekday: 'short' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Fetch Weather Data
async function fetchWeather(city) {
    try {
        // 1. Get Coordinates using Open-Meteo Geocoding API
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en&format=json`);
        const geoData = await geoRes.json();
        
        if (!geoData.results) {
            alert("City not found!");
            return;
        }

        const location = geoData.results[0];
        const lat = location.latitude;
        const lon = location.longitude;
        cityNameEl.innerText = `${location.name}, ${location.country}`;

        // Set Current Date
        dateEl.innerText = formatDate(new Date());

        // 2. Get Weather Data from Open-Meteo
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,visibility&daily=weather_code,temperature_2m_max,temperature_2m_min,uv_index_max&timezone=auto`;
        
        const weatherRes = await fetch(weatherUrl);
        const weatherData = await weatherRes.json();

        // Populate Current Weather
        const current = weatherData.current;
        const daily = weatherData.daily;
        const details = getWeatherDetails(current.weather_code);

        tempEl.innerText = `${Math.round(current.temperature_2m)}°`;
        conditionEl.innerText = details.text;
        iconEl.className = `fa-solid ${details.icon}`;
        highLowEl.innerText = `H:${Math.round(daily.temperature_2m_max[0])}° L:${Math.round(daily.temperature_2m_min[0])}°`;

        // Populate Metrics
        windEl.innerText = `${current.wind_speed_10m} km/h`;
        humidityEl.innerText = `${current.relative_humidity_2m}%`;
        uvEl.innerText = daily.uv_index_max[0];
        visibilityEl.innerText = `${(current.visibility / 1000).toFixed(1)} km`;

        // Populate 7-Day Forecast (Skip today, show next 6 days to fit UI)
        forecastContainer.innerHTML = '';
        for (let i = 1; i < 7; i++) {
            const dayDetails = getWeatherDetails(daily.weather_code[i]);
            const card = document.createElement('div');
            card.className = 'forecast-card glass-panel';
            
            card.innerHTML = `
                <div class="day">${getShortDay(daily.time[i])}</div>
                <i class="fa-solid ${dayDetails.icon}"></i>
                <div class="temps">
                    ${Math.round(daily.temperature_2m_max[i])}°
                    <span>${Math.round(daily.temperature_2m_min[i])}°</span>
                </div>
            `;
            forecastContainer.appendChild(card);
        }

    } catch (error) {
        console.error("Error fetching weather:", error);
        alert("Failed to fetch weather data. Try again.");
    }
}

// Event Listener for Search
cityInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        fetchWeather(cityInput.value);
    }
});

// Initial Load
fetchWeather('Coimbatore');