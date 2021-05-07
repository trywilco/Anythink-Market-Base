# frozen_string_literal: true

json.call(comment, :id, :body)
json.createdAt comment.created_at
json.updatedAt comment.updated_at
json.seller comment.user, partial: 'profiles/profile', as: :user
