# Solo ELEC OpenWeather App

A simple web-based weather application built with HTML, CSS, and JavaScript that uses the OpenWeatherMap API to fetch and display real-time weather data for a given city.

This project was created as a solo assignment for the ELEC3.

## Features

- Enter a city name to fetch and display:
  - Current temperature
  - Weather condition (e.g., clear, rain)
  - Additional weather details (humidity, wind speed, etc.)
- Real-time update using the OpenWeatherMap API. :contentReference[oaicite:1]{index=1}

## Demo

To try the application, open the `index.html` file in a web browser after setup.

## Technologies Used

- HTML – Structure of the web page  
- CSS – Styling and layout  
- JavaScript – Fetch API requests and DOM updates  
- OpenWeatherMap API – Weather data source

## Getting Started

The following instructions will help you run the project locally.

### Prerequisites

To use this project, you need:

- A modern web browser (Chrome, Firefox, Safari, Edge)
- A free API key from OpenWeatherMap (you must sign up) :contentReference[oaicite:2]{index=2}

### Installation

1. Clone the repository
    ```bash
    git clone https://github.com/GrantArachea/Arachea_Grant_Jimrey_Solo_ELEC_OpenWeather.git
    ```

2. Navigate to project folder
    ```bash
    cd Arachea_Grant_Jimrey_Solo_ELEC_OpenWeather
    ```

3. Open `index.html` in your browser
    - Double-click the file
    - or right-click → Open With → Browser

### API Configuration

1. Go to **OpenWeatherMap** and register for a free account.  
2. From your account dashboard, copy your API Key  
3. In the project, open `script.js` and replace the placeholder value for the API key with your own:

    ```javascript
    const apiKey = "YOUR_OPENWEATHERMAP_API_KEY";
    ```

4. Save the changes.

## Usage

- In the browser, type a city name into the search field.  
- Press Enter or click the Search button.  
- The app will fetch weather data and display:
  - Current temperature  
  - Weather status (e.g., “Cloudy”)  
  - Other relevant metrics (humidity, wind, etc.)


