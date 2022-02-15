# frozen_string_literal: true
include Faraday
require_relative "../../lib/event"
include Event

class PingController < ApplicationController
  def index
    response = sendEvent("ping", nil)
    render json: response.body
  end
end
