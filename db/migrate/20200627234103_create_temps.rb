class CreateTemps < ActiveRecord::Migration[5.2]
  def change
    create_table :temps do |t|
      t.string :min
      t.string :max
      t.string :date
      t.string :hours
      t.string :forecast

      t.timestamps
    end
  end
end
