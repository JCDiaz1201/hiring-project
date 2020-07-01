class Temp < ApplicationRecord
    attr_accessor :postWeatherData, :postNewWeatherData

    # This method is called every 30 minuted by the wheneverize gem to update the db records with the latest data
    def self.getWeatherInterval
        @tempModel = Temp
        
        response = RestClient.get("http://api.worldweatheronline.com/premium/v1/weather.ashx?key=#{ENV['WEATHER_API_KEY']}&q=30.404251,-97.849442&num_of_days=3&extra=utcDateTime&format=json", headers={})
        jsonified_response = JSON.parse(response)
    
        # The model parses the returned object and extracts the relevant information then inseting said info into the the DB
        self.postNewWeatherData(jsonified_response);
    end

    # Initial data fromt the past does not include forecast
    def self.postWeatherData(data)
        data['data']['weather'].each do |item|
            item["hourly"].each do |hourlyObject|
                6.times {
                    Temp.create(
                        date: item["date"], 
                        min: item["mintempF"], 
                        max: item["maxtempF"], 
                        hours: hourlyObject["tempF"],
                        # A dummy forecast was created to seed the deployed version 
                        forecast: [75, 98, 74, 100]
                    )
                }
            end
        end
    end

    # Since original data from the past does not include forecast data,
    # all subsequent data gathered from interval and daily function calls
    # will be parsed by the following function allowing for a forecast record to be kept
    def self.postNewWeatherData(data)
        # puts data
        hourly_array = Array.new
        forecast_array = Array.new

        forecast_array.push(data['data']['weather'][1]["mintempF"])
        forecast_array.push(data['data']['weather'][1]["maxtempF"])
        forecast_array.push(data['data']['weather'][2]["mintempF"])
        forecast_array.push(data['data']['weather'][2]["maxtempF"])

        Temp.create(
            date: data['data']['weather'][0]["date"], 
            min: data['data']['weather'][0]["mintempF"], 
            max: data['data']['weather'][0]["maxtempF"], 
            hours: data['data']['current_condition'][0]["temp_F"],
            forecast: forecast_array
        )
    end
end
