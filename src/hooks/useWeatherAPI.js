import { useState, useEffect, useCallback } from 'react';

const fetchCurrentWeather = ({ authorizationKey, locationName }) => {
    return fetch(
        `https://opendata.cwa.gov.tw/api/v1/rest/datastore/O-A0003-001?Authorization=${authorizationKey}&StationName=${locationName}`
    )
        .then((response) => response.json())
        .then((data) => {
            const locationData = data.records.Station[0];

            return {
                observationTime: locationData.ObsTime.DateTime,
                temperature: locationData.WeatherElement.AirTemperature,
                windSpeed: locationData.WeatherElement.WindSpeed,
                locationName: locationData.StationName,
                description: locationData.WeatherElement.Weather,
                isLoading: false,
            };
        });
};

const fetchWeatherForecast = ({ authorizationKey, cityName }) => {
    return fetch(`https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=${authorizationKey}&locationName=${cityName}`)
        .then((response) => response.json())
        .then((data) => {
            const localtionData = data.records.location[0];

            const weatherElements = localtionData.weatherElement.reduce(
                (neededElement, item) => {
                    if (['Wx', 'PoP', 'CI'].includes(item.elementName)) {
                        neededElement[item.elementName] = item.time[0].parameter;
                    }
                    return neededElement;
                },
                {}
            );

            return {
                description: weatherElements.Wx.parameterName,
                weatherCode: weatherElements.Wx.parameterValue,
                rainPossibility: weatherElements.PoP.parameterName,
                confortability: weatherElements.CI.parameterName,
            };

        });
};

const useWeatherAPI = ({ locationName, cityName, authorizationKey }) => {

    // STEP 2：定義會使用到的資料狀態
    const [weatherElement, setWeatherElement] = useState({
        observationTime: '2020-12-12 22:10:00',
        locationName: '臺北市',
        description: '多雲時晴',
        windSpeed: 3.6,
        temperature: 32.1,
        rainPossibility: 60,
        comfortability: '舒適',
        weatherCode: 0,
        isLoading: true,
    });

    const fetchData = useCallback(async () => {
        setWeatherElement((prevState) => ({
            ...prevState,
            isLoading: true,
        }));

        const [currentWeather, weatherForecast] = await Promise.all([
            fetchCurrentWeather({ authorizationKey, locationName }),
            fetchWeatherForecast({ authorizationKey, cityName }),
        ]);

        setWeatherElement({
            ...currentWeather,
            ...weatherForecast,
            isLoading: false,
        });
    }, [authorizationKey, cityName, locationName]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return [weatherElement, fetchData];

};

export default useWeatherAPI;