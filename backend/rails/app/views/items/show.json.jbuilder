# frozen_string_literal: true

json.item do |json|
  json.partial! 'items/item', item: @item
end
