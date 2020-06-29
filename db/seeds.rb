# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)

seed_data_List = [
  [ "Germany", 81831000 ],
  [ "France", 65447374 ],
  [ "Belgium", 10839905 ],
  [ "Netherlands", 16680000 ]
]

seed_data_List.each do |date, min, max, hours, forecast|
  Country.create( date: date, min: min, max: max, hours: hours, forecast: forecast)
end

#Temp.create :date => "2020-06-28", :min => "70", :max => "93", :hours => "[\"77\", \"76\", \"76\", \"80\", \"82\", \"86\", \"83\", \"79\"]", :forecast => "[\"45\", \"65\", \"55\", \"79\"]"