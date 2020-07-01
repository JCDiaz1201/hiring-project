class Temp < ApplicationRecord
    attr_accessor :postWeatherData, :postNewWeatherData

    # Initial data fromt the past does not include forecast
    def self.postWeatherData(data)
        # hourly_array = Array.new

        # data['data']['weather'].each do |item|
        #     item["hourly"].each do |hourlyObject|
        #         hourly_array.push(hourlyObject["tempF"])
        #     end

        #     Temp.create(
        #         date: item["date"], 
        #         min: item["mintempF"], 
        #         max: item["maxtempF"], 
        #         hours: hourly_array
        #     )
        #     hourly_array = []
        # end
        # Below is theortical framework for half hourly data entry for historical data
        data['data']['weather'].each do |item|
            item["hourly"].each do |hourlyObject|
                6.times {
                    Temp.create(
                        date: item["date"], 
                        min: item["mintempF"], 
                        max: item["maxtempF"], 
                        hours: hourlyObject["tempF"]
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

        # data['data']['weather'][0]["hourly"].each do |hourlyObject|
        #     hourly_array.push(hourlyObject["tempF"])
        # end

        Temp.create(
            date: data['data']['weather'][0]["date"], 
            min: data['data']['weather'][0]["mintempF"], 
            max: data['data']['weather'][0]["maxtempF"], 
            hours: data['data']['current_condition'][0]["temp_F"],
            forecast: forecast_array
        )
    end
end

# record = Temp.create :date => "2020-06-29", :min => "70", :max => "93", :hours => "[\"45\"]", :forecast => "[\"45\", \"65\", \"55\", \"79\"]"
