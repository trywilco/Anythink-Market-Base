# frozen_string_literal: true

class CreateItems < ActiveRecord::Migration[5.0]
  def change
    create_table :items do |t|
      t.string :title
      t.string :slug
      t.string :description
      t.string :image
      t.integer :favorites_count
      t.references :user, index: true, foreign_key: true

      t.timestamps null: false
    end
    add_index :items, :slug, unique: true
  end
end
