require 'date'

# Below is the API call for the current temps
# http://api.worldweatheronline.com/premium/v1/weather.ashx?key= ENV_KEY &q=30.404251,-97.849442&num_of_days=1&tp=3&format=json
# * * *
# Below is the API call for the past temps with additional parameters
# http://api.worldweatheronline.com/premium/v1/past-weather.ashx?key= ENV_KEY &q=30.404251,-97.849442&date=2020-06-01&enddate=2020-06-26&format=json
# * * *
# Below is of API call for future forecast
# http://api.worldweatheronline.com/premium/v1/weather.ashx?key= ENV_KEY &q=30.404251,-97.849442&date=2020-06-27&num_of_days=3&extra=utcDateTime&format=json

class TempsController < ApplicationController
  before_action :set_temp, only: [:show, :edit, :update, :destroy]

  # This is the initial weather gathing function, backlogs historical data
  def getWeatherData
    @tempModel = Temp
    current_date = Date.yesterday.strftime "%Y-%m-%d"

    response = RestClient.get("http://api.worldweatheronline.com/premium/v1/past-weather.ashx?key=#{ENV['WEATHER_API_KEY']}&q=30.404251,-97.849442&date=2020-06-01&enddate=#{current_date}&format=json
    ", headers={})
    jsonified_response = JSON.parse(response)

    @tempModel.postWeatherData(jsonified_response);
  end

  # This function pings the weather API for updates on the daily weather, called updateRecords() below
  def getWeatherInterval
    @tempModel = Temp
    
    response = RestClient.get("http://api.worldweatheronline.com/premium/v1/weather.ashx?key=#{ENV['WEATHER_API_KEY']}&q=30.404251,-97.849442&num_of_days=3&extra=utcDateTime&format=json", headers={})
    jsonified_response = JSON.parse(response)

    # The model parses the returned object and extracts the relevant information then inseting said info into the the DB
    @tempModel.postNewWeatherData(jsonified_response);
  end

  # This function initially populates the database with pertinent data on app launch
  def populateDatabase
    self.getWeatherData()
    @temps = Temp.last(25)
    render json: @temps
  end

  # This function is invoked by an ajax request by application.js, returing the updated info from the newly minted data from the API request in getWeatherInterval()
  def updateRecords
    self.getWeatherInterval
    @temps = Temp.last(25)
    render json: @temps
  end

  # Below is controller call for half hourly data entry for historical data
  def updateRecordsInterval
    self.getWeatherInterval
    # Attempt to retrive every 48th record for daily highs and lows chart
    # @temps = Temp.find(:conditions => 'MOD(ROW_NUM,48) = 0') 
    @temps = Temp.last(25)
    render json: @temps
  end

  def index
    @temps = Temp.last(25)
    # @temps = Temp.all
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_temp
      @temp = Temp.find(params[:id])
    end

    # Only allow a list of trusted parameters through.
    def temp_params
      params.require(:temp).permit(:min, :max, :date)
    end
end

