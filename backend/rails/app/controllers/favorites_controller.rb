# frozen_string_literal: true

class FavoritesController < ApplicationController
  before_action :authenticate_user!
  before_action :find_item!

  def create
    current_user.favorite(@item)

    render 'items/show'
  end

  def destroy
    current_user.unfavorite(@item)

    render 'items/show'
  end

  private

  def find_item!
    @item = Item.find_by!(slug: params[:item_slug])
  end
end
