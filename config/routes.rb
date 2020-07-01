Rails.application.routes.draw do
  resources :temps
  # get 'home/index'
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html

  root :to => 'temps#index'
  post '/temps/updaterecords', to: 'temps#updateRecords'
  post '/temps/populatedatabase', to: 'temps#populateDatabase'

  # Below is route for half hourly data entry for historical data
  post '/temps/updaterecordsinterval', to: 'temps#updateRecordsInterval'
  post '/temps/updaterecordsintervalnew', to: 'temps#updateRecordsIntervalNew'
end
