# frozen_string_literal: true

json.call(item, :title, :slug, :description, :image)
json.createdAt item.created_at
json.updatedAt item.updated_at
json.tagList item.tag_list
json.seller item.user, partial: 'profiles/profile', as: :user
json.favorited signed_in? ? current_user.favorited?(item) : false
json.favorites_count item.favorites_count || 0
