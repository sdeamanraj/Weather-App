const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const userContainer = document.querySelector(".weather-container");
const cityErrorP = document.querySelector(".city-error");
const internetErrorP = document.querySelector(".internet-error");

// 5 containers
const grantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");
const errorContainer = document.querySelector(".error-container");

// initially variables
let currentTab = userTab;
const API_KEY = '32395743be16fca551a1aabb901c9ce8';
currentTab.classList.add("current-tab");
getFromSessionStorage();

// tab switch
userTab.addEventListener("click",()=>{
    // pass clicked tab
    switchTab(userTab);
});
searchTab.addEventListener("click",()=>{
    // pass clicked tab
    switchTab(searchTab);
});
function switchTab(clickedTab){
    if(clickedTab != currentTab){
        currentTab.classList.remove("current-tab");
        currentTab = clickedTab;
        currentTab.classList.add("current-tab");

        // show search tab
        if(!searchForm.classList.contains("active")){
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            searchForm.classList.add("active");
        } 
        // show main tab
        else{
            searchForm.classList.remove("active");
            userInfoContainer.classList.add("active");
            getFromSessionStorage();
        }
    }
}
function getFromSessionStorage(){
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if(!localCoordinates){
        userInfoContainer.classList.remove("active");
        grantAccessContainer.classList.add("active");
    } else{
        const coordinated = JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinated);
    }
}
async function fetchUserWeatherInfo(coordinates){
    const {lat,lon} = coordinates;
    grantAccessContainer.classList.remove("active");
    loadingScreen.classList.add("active");
    // API call
    try{
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        const data = await response.json();
        renderWeatherInfo(data);
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
    } catch(e){
        loadingScreen.classList.remove("active");
        errorContainer.classList.add("active");
        internetErrorP.classList.add('active');
        console.log("API Error:",e);
    }
}
function renderWeatherInfo(weatherInfo){
    // fetch elements
    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const desc = document.querySelector("[data-weatherDesc]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-temp]");
    const windspeed = document.querySelector("[data-windspeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-cloudiness]");

    cityName.innerText = weatherInfo?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    desc.innerText = weatherInfo?.weather?.[0]?.description;
    weatherIcon.src = `https://openweathermap.org/img/wn/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.innerText = `${weatherInfo?.main?.temp} °C`;
    windspeed.innerText = `${weatherInfo?.wind?.speed}m/s`;
    humidity.innerText = `${weatherInfo?.main?.humidity}%`;
    cloudiness.innerText = `${weatherInfo?.clouds?.all}%`;
}

// Location access
const grantAccessButton = document.querySelector("[data-grantAccess]");
grantAccessButton.addEventListener("click",getLocation);
function getLocation(){
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(showPosition);
    } else{
        // alert for no geolocation
        console.log("Unable to use geolocation");
    }
}
function showPosition(position){
    const userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
    }
    sessionStorage.setItem("user-coordinates",JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);
}

// Search Location
const searchInput = document.querySelector("[data-searchInput]");
searchForm.addEventListener("submit",(e)=>{
    e.preventDefault();
    let cityName = searchInput.value;
    if(cityName==="") return;
    else fetchSearchWeatherInfo(cityName);
})
async function fetchSearchWeatherInfo(city){
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");
    try{
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
        const data = await response.json();
        if(response?.ok==false) throw new Error('No city found');
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    } catch(e){
        loadingScreen.classList.remove("active");
        errorContainer.classList.add("active");
        cityErrorP.classList.add('active');
        console.log("Fetch weather error: ",e);
    }
}
document.addEventListener('click', (event) => {
    if (errorContainer.classList.contains('active')) {
        errorContainer.classList.remove('active');
    }
});