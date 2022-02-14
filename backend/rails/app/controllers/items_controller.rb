# frozen_string_literal: true
require_relative "../../lib/event"
include Event

class ItemsController < ApplicationController
  before_action :authenticate_user!, except: %i[index show]

  def index
    @items = Item.all.includes(:user)

    @items = @items.tagged_with(params[:tag]) if params[:tag].present?
    @items = @items.sellered_by(params[:seller]) if params[:seller].present?
    @items = @items.favorited_by(params[:favorited]) if params[:favorited].present?

    @items_count = @items.count

    @items = @items.order(created_at: :desc).offset(params[:offset] || 0).limit(params[:limit] || 20)
  end

  def feed
    @items = Item.includes(:user).where(user: current_user.following_users)

    @items_count = @items.count

    @items = @items.order(created_at: :desc).offset(params[:offset] || 0).limit(params[:limit] || 20)

    render :index
  end

  def create
    @item = Item.new(item_params)
    @item.user = current_user

    if @item.save
      sendEvent("item_created", { item: item_params })
      render :show
    else
      render json: { errors: @item.errors }, status: :unprocessable_entity
    end
  end

  def show
    @item = Item.find_by!(slug: params[:slug])
  end

  def update
    @item = Item.find_by!(slug: params[:slug])

    if @item.user_id == @current_user_id
      @item.update_attributes(item_params)

      render :show
    else
      render json: { errors: { item: ['not owned by user'] } }, status: :forbidden
    end
  end

  def destroy
    @item = Item.find_by!(slug: params[:slug])

    if @item.user_id == @current_user_id
      @item.destroy

      render json: {}
    else
      render json: { errors: { item: ['not owned by user'] } }, status: :forbidden
    end
  end

  private

  def item_params
    params.require(:item).permit(:title, :description, :image, tag_list: [])
  end
end
