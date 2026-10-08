from django.contrib import admin
from .models import Account


@admin.register(Account)
class AccountAdmin(admin.ModelAdmin):
    list_display = ('id', 'email', 'name', 'phone', 'is_admin', 'is_active', 'created_at')
    # is_admin / is_active editable directly from the changelist (no need to open each row)
    list_editable = ('is_admin', 'is_active')
    list_display_links = ('id', 'email')
    list_filter = ('is_admin', 'is_active')
    search_fields = ('email', 'name')
    readonly_fields = ('created_at', 'updated_at')
    # Explicit edit form so is_admin is always visible/editable on the detail page
    fields = ('email', 'name', 'phone', 'avatar', 'is_admin', 'is_active',
              'created_at', 'updated_at')
    actions = ('make_admin', 'remove_admin')

    @admin.action(description="Promote selected accounts to admin")
    def make_admin(self, request, queryset):
        queryset.update(is_admin=True)

    @admin.action(description="Demote selected accounts from admin")
    def remove_admin(self, request, queryset):
        queryset.update(is_admin=False)