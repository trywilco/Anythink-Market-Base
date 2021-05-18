# frozen_string_literal: true

class SessionsController < Devise::SessionsController
  def create
  print "========================= 1"
    user = User.find_by(email: sign_in_params[:email])
    print "========================= 2"

    if user && user.valid_password?(sign_in_params[:password])
      @current_user = user
    else
      render json: { errors: { 'email or password' => ['is invalid'] } }, status: :unprocessable_entity
    end
  end
end
