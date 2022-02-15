# frozen_string_literal: true
require_relative "../../lib/event"
include Event

class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable

  has_many :items, dependent: :destroy
  has_many :favorites, dependent: :destroy
  has_many :comments, dependent: :destroy

  acts_as_follower
  acts_as_followable

  validates :username, uniqueness: { case_sensitive: true },
                       format: { with: /\A[a-zA-Z0-9]+\z/ },
                       presence: true,
                       allow_blank: false

  after_create :on_user_created

  def on_user_created
    sendEvent("user_created", { username: self.username })
  end

  def generate_jwt
    JWT.encode({ id: id,
                 exp: 60.days.from_now.to_i },
               Rails.application.secrets.secret_key_base)
  end

  def favorite(item)
    favorites.find_or_create_by(item: item)
  end

  def unfavorite(item)
    favorites.where(item: item).destroy_all

    item.reload
  end

  def favorited?(item)
    favorites.find_by(item_id: item.id).present?
  end
end
