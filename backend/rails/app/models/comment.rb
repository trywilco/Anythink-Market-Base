# frozen_string_literal: true

class Comment < ApplicationRecord
  belongs_to :user
  belongs_to :item

  validates :body, presence: true, allow_blank: false
end
