# frozen_string_literal: true

require_relative "../../lib/event"
include Event

class RegistrationsController < Devise::RegistrationsController
  def create
    super

    if @user.persisted?
      sendEvent("user_created", { username: @user.username })
    end
  end
end
