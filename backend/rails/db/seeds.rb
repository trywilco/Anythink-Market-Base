# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)

100.times do
	rand_part = Random.hex[0..10]
	user = User.create! email: "#{rand_part}@test.com", password: rand_part, username: "user#{rand_part}"
	item = Item.create! title: "test item #{rand_part}", description: 'amazing', user: user
	comment = Comment.create! user: user, item: item, body: 'a comment is here'
end
