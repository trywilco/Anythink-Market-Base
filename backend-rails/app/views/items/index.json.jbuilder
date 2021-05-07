# frozen_string_literal: true

json.items do |json|
  json.array! @items, partial: 'items/item', as: :item
end

json.items_count @items_count
