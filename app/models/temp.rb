class Temp < ApplicationRecord
    attr_accessor :postWeatherData, :postNewWeatherData

    # Initial data fromt the past does not include forecast
    def self.postWeatherData(data)
        hourly_array = Array.new

        data['data']['weather'].each do |item|
            item["hourly"].each do |hourlyObject|
                hourly_array.push(hourlyObject["tempF"])
            end

            Temp.create(
                date: item["date"], 
                min: item["mintempF"], 
                max: item["maxtempF"], 
                hours: hourly_array
            )
            hourly_array = []
        end
    end

    # Since original data from the past does not include forecast data,
    # all subsequent data gathered from interval and daily function calls
    # will be parsed by the following function allowing for a forecast record to be kept
    def self.postNewWeatherData(data)
        hourly_array = Array.new
        forecast_array = Array.new

        forecast_array.push(data['data']['weather'][1]["mintempF"])
        forecast_array.push(data['data']['weather'][1]["maxtempF"])
        forecast_array.push(data['data']['weather'][2]["mintempF"])
        forecast_array.push(data['data']['weather'][2]["maxtempF"])

        data['data']['weather'][0]["hourly"].each do |hourlyObject|
            hourly_array.push(hourlyObject["tempF"])
        end

        Temp.create(
            date: data['data']['weather'][0]["date"], 
            min: data['data']['weather'][0]["mintempF"], 
            max: data['data']['weather'][0]["maxtempF"], 
            hours: hourly_array,
            forecast: forecast_array
        )
    end
end
