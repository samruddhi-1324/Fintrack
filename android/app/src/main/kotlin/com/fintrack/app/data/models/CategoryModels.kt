package com.fintrack.app.data.models

import com.google.gson.annotations.SerializedName

data class CategoryResponse(
    @SerializedName("id") val id: String,
    @SerializedName("user_id") val userId: String? = null,
    @SerializedName("name") val name: String,
    @SerializedName("is_default") val isDefault: Boolean = false,
    @SerializedName("created_at") val createdAt: String? = null
)

data class CategoryCreateRequest(
    @SerializedName("name") val name: String
)

data class CategoryUpdateRequest(
    @SerializedName("name") val name: String
)
