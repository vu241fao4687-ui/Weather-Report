const cityInput = document.getElementById("cityInput");
const searchButton = document.getElementById("searchButton");
const locationButton = document.getElementById("locationButton");

const themeButton = document.getElementById("themeButton");
const unitButton = document.getElementById("unitButton");
const installButton = document.getElementById("installButton");

const loading = document.getElementById("loading");
const errorMessage = document.getElementById("errorMessage");

const weatherContent = document.getElementById("weatherContent");

const cityName = document.getElementById("cityName");
const countryName = document.getElementById("countryName");
const dateTime = document.getElementById("dateTime");

const weatherDescription =
    document.getElementById("weatherDescription");

const weatherIcon =
    document.getElementById("weatherIcon");

const temperature =
    document.getElementById("temperature");

const feelsLike =
    document.getElementById("feelsLike");

const humidity =
    document.getElementById("humidity");

const windSpeed =
    document.getElementById("windSpeed");

const rainChance =
    document.getElementById("rainChance");

const uvIndex =
    document.getElementById("uvIndex");

const sunrise =
    document.getElementById("sunrise");

const sunset =
    document.getElementById("sunset");

const hourlyContainer =
    document.getElementById("hourlyContainer");

const forecastContainer =
    document.getElementById("forecastContainer");

const favoritesContainer =
    document.getElementById("favoritesContainer");

const favoriteButton =
    document.getElementById("favoriteButton");

const alertSection =
    document.getElementById("alertSection");

const alertContainer =
    document.getElementById("alertContainer");

const latitudeElement =
    document.getElementById("latitude");

const longitudeElement =
    document.getElementById("longitude");

const timezoneElement =
    document.getElementById("timezone");


let currentWeatherData = null;

let currentUnit =
    localStorage.getItem("weatherUnit") || "C";

let favorites =
    JSON.parse(localStorage.getItem("weatherFavorites")) || [];

let temperatureChart = null;

let map = null;

let mapMarker = null;

let deferredInstallPrompt = null;


const weatherCodes = {

    0: {
        description: "Clear Sky",
        icon: "☀️"
    },

    1: {
        description: "Mainly Clear",
        icon: "🌤️"
    },

    2: {
        description: "Partly Cloudy",
        icon: "⛅"
    },

    3: {
        description: "Overcast",
        icon: "☁️"
    },

    45: {
        description: "Fog",
        icon: "🌫️"
    },

    48: {
        description: "Rime Fog",
        icon: "🌫️"
    },

    51: {
        description: "Light Drizzle",
        icon: "🌦️"
    },

    53: {
        description: "Moderate Drizzle",
        icon: "🌦️"
    },

    55: {
        description: "Dense Drizzle",
        icon: "🌧️"
    },

    61: {
        description: "Light Rain",
        icon: "🌦️"
    },

    63: {
        description: "Moderate Rain",
        icon: "🌧️"
    },

    65: {
        description: "Heavy Rain",
        icon: "🌧️"
    },

    71: {
        description: "Light Snow",
        icon: "🌨️"
    },

    73: {
        description: "Moderate Snow",
        icon: "❄️"
    },

    75: {
        description: "Heavy Snow",
        icon: "❄️"
    },

    80: {
        description: "Light Rain Showers",
        icon: "🌦️"
    },

    81: {
        description: "Moderate Rain Showers",
        icon: "🌧️"
    },

    82: {
        description: "Heavy Rain Showers",
        icon: "⛈️"
    },

    95: {
        description: "Thunderstorm",
        icon: "⛈️"
    },

    96: {
        description: "Thunderstorm With Hail",
        icon: "⛈️"
    },

    99: {
        description: "Heavy Thunderstorm",
        icon: "⛈️"
    }

};


function showLoading() {

    loading.classList.remove("hidden");

    errorMessage.classList.add("hidden");

    weatherContent.classList.add("hidden");

}


function hideLoading() {

    loading.classList.add("hidden");

}


function showError(message) {

    hideLoading();

    errorMessage.textContent = message;

    errorMessage.classList.remove("hidden");

}


function getWeatherInfo(code) {

    return weatherCodes[code] || {
        description: "Unknown",
        icon: "🌡️"
    };

}


function formatTime(time) {

    return new Date(time).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });

}


function formatDate(time) {

    return new Date(time).toLocaleDateString([], {
        weekday: "long",
        month: "long",
        day: "numeric"
    });

}


function convertTemperature(value) {

    if (currentUnit === "C") {
        return Math.round(value);
    }

    return Math.round((value * 9 / 5) + 32);

}


async function searchCity(city) {

    if (!city.trim()) {

        showError("Please enter a city name.");

        return;

    }

    showLoading();

    try {

        const url =
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

        const response =
            await fetch(url);

        if (!response.ok) {
            throw new Error("Unable to search for this city.");
        }

        const data =
            await response.json();

        if (!data.results || data.results.length === 0) {

            throw new Error(
                "City not found. Try another city."
            );

        }

        const location =
            data.results[0];

        await getWeather(
            location.latitude,
            location.longitude,
            location.name,
            location.country
        );

    } catch (error) {

        showError(error.message);

    }

}


async function getWeather(
    latitude,
    longitude,
    name,
    country = ""
) {

    showLoading();

    try {

        const url =
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,precipitation_probability,weather_code,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset,uv_index_max&timezone=auto&forecast_days=5`;

        const response =
            await fetch(url);

        if (!response.ok) {

            throw new Error(
                "Unable to fetch weather data."
            );

        }

        const data =
            await response.json();

        currentWeatherData = {
            data,
            latitude,
            longitude,
            name,
            country
        };

        displayWeather(currentWeatherData);

    } catch (error) {

        showError(error.message);

    }

}


function displayWeather(weather) {

    hideLoading();

    errorMessage.classList.add("hidden");

    weatherContent.classList.remove("hidden");

    const data =
        weather.data;

    const current =
        data.current;

    const info =
        getWeatherInfo(current.weather_code);


    cityName.textContent =
        weather.name;

    countryName.textContent =
        weather.country || "Your Location";

    dateTime.textContent =
        `${formatDate(current.time)} • ${formatTime(current.time)}`;

    weatherDescription.textContent =
        info.description;

    weatherIcon.textContent =
        info.icon;


    temperature.textContent =
        convertTemperature(current.temperature_2m);

    feelsLike.textContent =
        convertTemperature(current.apparent_temperature);


    humidity.textContent =
        `${current.relative_humidity_2m}%`;

    windSpeed.textContent =
        `${Math.round(current.wind_speed_10m)} km/h`;


    const currentHour =
        findCurrentHourIndex(data.hourly.time);

    if (currentHour !== -1) {

        rainChance.textContent =
            `${data.hourly.precipitation_probability[currentHour]}%`;

        uvIndex.textContent =
            data.hourly.uv_index[currentHour] ?? "--";

    }


    sunrise.textContent =
        formatTime(data.daily.sunrise[0]);

    sunset.textContent =
        formatTime(data.daily.sunset[0]);


    latitudeElement.textContent =
        Number(weather.latitude).toFixed(4);

    longitudeElement.textContent =
        Number(weather.longitude).toFixed(4);

    timezoneElement.textContent =
        data.timezone;


    displayHourly(data);

    displayForecast(data);

    createTemperatureChart(data);

    createWeatherAlerts(data);

    updateFavoriteButton();

    updateMap(
        weather.latitude,
        weather.longitude,
        weather.name
    );

}


function findCurrentHourIndex(times) {

    const now =
        new Date();

    let closest =
        0;

    let smallestDifference =
        Infinity;

    times.forEach((time, index) => {

        const difference =
            Math.abs(
                new Date(time).getTime() -
                now.getTime()
            );

        if (difference < smallestDifference) {

            smallestDifference =
                difference;

            closest =
                index;

        }

    });

    return closest;

}


function displayHourly(data) {

    hourlyContainer.innerHTML = "";

    const currentIndex =
        findCurrentHourIndex(data.hourly.time);


    for (
        let i = currentIndex;
        i < Math.min(currentIndex + 24, data.hourly.time.length);
        i++
    ) {

        const time =
            new Date(data.hourly.time[i]);

        const info =
            getWeatherInfo(data.hourly.weather_code[i]);


        const card =
            document.createElement("div");

        card.className =
            "hourly-card";


        const timeText =
            i === currentIndex
                ? "Now"
                : time.toLocaleTimeString([], {
                    hour: "numeric"
                });


        card.innerHTML = `

            <div class="hourly-time">
                ${timeText}
            </div>

            <div class="hourly-icon">
                ${info.icon}
            </div>

            <div class="hourly-temp">
                ${convertTemperature(
                    data.hourly.temperature_2m[i]
                )}°
            </div>

            <div class="hourly-rain">
                💧 ${data.hourly.precipitation_probability[i] ?? 0}%
            </div>

        `;


        hourlyContainer.appendChild(card);

    }

}


function displayForecast(data) {

    forecastContainer.innerHTML = "";


    for (
        let i = 0;
        i < data.daily.time.length;
        i++
    ) {

        const info =
            getWeatherInfo(data.daily.weather_code[i]);


        const day =
            new Date(data.daily.time[i])
                .toLocaleDateString([], {
                    weekday: "short"
                });


        const max =
            convertTemperature(
                data.daily.temperature_2m_max[i]
            );

        const min =
            convertTemperature(
                data.daily.temperature_2m_min[i]
            );


        const card =
            document.createElement("div");

        card.className =
            "forecast-card";


        card.innerHTML = `

            <div class="forecast-day">
                ${i === 0 ? "Today" : day}
            </div>

            <div class="forecast-icon">
                ${info.icon}
            </div>

            <div class="forecast-description">
                ${info.description}
            </div>

            <div class="forecast-temp">
                <span class="max-temp">
                    ${max}°
                </span>

                <span class="min-temp">
                    ${min}°
                </span>
            </div>

            <div class="forecast-rain">
                💧 ${data.daily.precipitation_probability_max[i] ?? 0}%
            </div>

        `;


        forecastContainer.appendChild(card);

    }

}


function createTemperatureChart(data) {

    const ctx =
        document.getElementById("temperatureChart");

    const currentIndex =
        findCurrentHourIndex(data.hourly.time);


    const labels = [];

    const temperatures = [];


    for (
        let i = currentIndex;
        i < Math.min(currentIndex + 24, data.hourly.time.length);
        i++
    ) {

        labels.push(
            new Date(
                data.hourly.time[i]
            ).toLocaleTimeString([], {
                hour: "numeric"
            })
        );


        temperatures.push(
            convertTemperature(
                data.hourly.temperature_2m[i]
            )
        );

    }


    if (temperatureChart) {
        temperatureChart.destroy();
    }


    temperatureChart =
        new Chart(ctx, {

            type: "line",

            data: {

                labels,

                datasets: [

                    {
                        label: `Temperature (°${currentUnit})`,

                        data: temperatures,

                        borderWidth: 3,

                        tension: 0.4,

                        fill: true,

                        pointRadius: 3

                    }

                ]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                plugins: {

                    legend: {
                        display: true
                    }

                },

                scales: {

                    y: {

                        beginAtZero: false,

                        ticks: {

                            callback: value =>
                                `${value}°`

                        }

                    }

                }

            }

        });

}


function createWeatherAlerts(data) {

    alertContainer.innerHTML = "";

    const alerts = [];

    const current =
        data.current;


    if (current.wind_speed_10m >= 50) {

        alerts.push(
            "Strong winds are currently indicated. Take appropriate precautions."
        );

    }


    if (current.relative_humidity_2m >= 90) {

        alerts.push(
            "Very high humidity is currently indicated."
        );

    }


    const index =
        findCurrentHourIndex(data.hourly.time);


    const rain =
        data.hourly.precipitation_probability[index];


    const code =
        data.current.weather_code;


    if (rain >= 70) {

        alerts.push(
            `High precipitation probability: ${rain}% for the current forecast hour.`
        );

    }


    if (code >= 95) {

        alerts.push(
            "Thunderstorm conditions are indicated by the weather model."
        );

    }


    if (
        data.hourly.uv_index[index] >= 8
    ) {

        alerts.push(
            "High UV index is indicated. Consider appropriate sun protection."
        );

    }


    if (alerts.length === 0) {

        alertSection.classList.add("hidden");

        return;

    }


    alerts.forEach(message => {

        const item =
            document.createElement("div");

        item.className =
            "alert-message";

        item.textContent =
            "• " + message;

        alertContainer.appendChild(item);

    });


    alertSection.classList.remove("hidden");

}


function isFavorite(name) {

    return favorites.some(
        city =>
            city.name.toLowerCase() ===
            name.toLowerCase()
    );

}


function updateFavoriteButton() {

    if (!currentWeatherData) {
        return;
    }

    const name =
        currentWeatherData.name;


    if (isFavorite(name)) {

        favoriteButton.textContent = "★";

        favoriteButton.classList.add("active");

    } else {

        favoriteButton.textContent = "☆";

        favoriteButton.classList.remove("active");

    }

}


function toggleFavorite() {

    if (!currentWeatherData) {
        return;
    }


    const location = {

        name:
            currentWeatherData.name,

        country:
            currentWeatherData.country,

        latitude:
            currentWeatherData.latitude,

        longitude:
            currentWeatherData.longitude

    };


    if (isFavorite(location.name)) {

        favorites =
            favorites.filter(
                city =>
                    city.name.toLowerCase() !==
                    location.name.toLowerCase()
            );

    } else {

        favorites.push(location);

    }


    localStorage.setItem(
        "weatherFavorites",
        JSON.stringify(favorites)
    );


    updateFavoriteButton();

    displayFavorites();

}


function displayFavorites() {

    favoritesContainer.innerHTML = "";


    if (favorites.length === 0) {

        const empty =
            document.createElement("span");

        empty.style.color =
            "var(--muted)";

        empty.style.fontSize =
            "13px";

        empty.textContent =
            "No favorite cities yet. Search a city and click ☆.";

        favoritesContainer.appendChild(empty);

        return;

    }


    favorites.forEach(city => {

        const wrapper =
            document.createElement("div");

        wrapper.className =
            "favorite-city";


        const button =
            document.createElement("button");

        button.className =
            "favorite-city";

        button.textContent =
            `⭐ ${city.name}`;


        button.onclick =
            () => {

                getWeather(
                    city.latitude,
                    city.longitude,
                    city.name,
                    city.country
                );

            };


        const remove =
            document.createElement("button");

        remove.className =
            "remove-favorite";

        remove.textContent =
            "×";


        remove.onclick =
            event => {

                event.stopPropagation();

                favorites =
                    favorites.filter(
                        item =>
                            item.name !== city.name
                    );


                localStorage.setItem(
                    "weatherFavorites",
                    JSON.stringify(favorites)
                );


                displayFavorites();

                updateFavoriteButton();

            };


        wrapper.appendChild(button);

        wrapper.appendChild(remove);

        favoritesContainer.appendChild(wrapper);

    });

}


function updateMap(latitude, longitude, name) {

    if (!map) {

        map =
            L.map("map").setView(
                [latitude, longitude],
                11
            );


        L.tileLayer(
            "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            {
                attribution:
                    '&copy; OpenStreetMap contributors',
                maxZoom: 19
            }
        ).addTo(map);


    } else {

        map.setView(
            [latitude, longitude],
            11
        );

    }


    if (mapMarker) {

        map.removeLayer(mapMarker);

    }


    mapMarker =
        L.marker([
            latitude,
            longitude
        ])
        .addTo(map)
        .bindPopup(
            `<strong>${name}</strong><br>Weather location`
        )
        .openPopup();


    setTimeout(() => {

        map.invalidateSize();

    }, 200);

}


function useCurrentLocation() {

    if (!navigator.geolocation) {

        showError(
            "Geolocation is not supported by your browser."
        );

        return;

    }


    showLoading();


    navigator.geolocation.getCurrentPosition(

        position => {

            getWeather(
                position.coords.latitude,
                position.coords.longitude,
                "Your Location",
                ""
            );

        },

        () => {

            showError(
                "Location access was denied or unavailable. Search for a city instead."
            );

        },

        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000
        }

    );

}


function updateTheme() {

    const isLight =
        document.body.classList.toggle("light");


    localStorage.setItem(
        "weatherTheme",
        isLight ? "light" : "dark"
    );


    themeButton.textContent =
        isLight ? "☀️" : "🌙";


    if (currentWeatherData) {

        createTemperatureChart(
            currentWeatherData.data
        );

    }

}


function loadTheme() {

    const savedTheme =
        localStorage.getItem("weatherTheme");


    if (savedTheme === "light") {

        document.body.classList.add("light");

        themeButton.textContent =
            "☀️";

    } else {

        themeButton.textContent =
            "🌙";

    }

}


function toggleUnit() {

    currentUnit =
        currentUnit === "C"
            ? "F"
            : "C";


    localStorage.setItem(
        "weatherUnit",
        currentUnit
    );


    unitButton.textContent =
        `°${currentUnit}`;


    if (currentWeatherData) {

        displayWeather(
            currentWeatherData
        );

    }

}


function registerPWA() {

    if ("serviceWorker" in navigator) {

        window.addEventListener(
            "load",
            () => {

                navigator.serviceWorker.register(
                    "sw.js"
                );

            }
        );

    }


    window.addEventListener(
        "beforeinstallprompt",
        event => {

            event.preventDefault();

            deferredInstallPrompt =
                event;

            installButton.classList.remove(
                "hidden"
            );

        }
    );

}


installButton.addEventListener(
    "click",
    async () => {

        if (!deferredInstallPrompt) {
            return;
        }


        deferredInstallPrompt.prompt();

        await deferredInstallPrompt.userChoice;

        deferredInstallPrompt = null;

        installButton.classList.add(
            "hidden"
        );

    }
);


searchButton.addEventListener(
    "click",
    () => {

        searchCity(
            cityInput.value
        );

    }
);


cityInput.addEventListener(
    "keypress",
    event => {

        if (event.key === "Enter") {

            searchCity(
                cityInput.value
            );

        }

    }
);


locationButton.addEventListener(
    "click",
    useCurrentLocation
);


favoriteButton.addEventListener(
    "click",
    toggleFavorite
);


themeButton.addEventListener(
    "click",
    updateTheme
);


unitButton.addEventListener(
    "click",
    toggleUnit
);


loadTheme();

displayFavorites();

unitButton.textContent =
    `°${currentUnit}`;

registerPWA();

searchCity("Guntur");

