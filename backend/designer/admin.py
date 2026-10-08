from django.contrib import admin
from .models import Designe, DesignGrid, Colors


class DesignGridInline(admin.TabularInline):
    model = DesignGrid
    extra = 0


@admin.register(Designe)
class DesigneAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'user', 'total_color_palettes',
                    'machine_type', 'starting_position', 'updated_at')
    list_filter = ('machine_type',)
    search_fields = ('name', 'user__email', 'user__name')
    inlines = [DesignGridInline]


@admin.register(Colors)
class ColorsAdmin(admin.ModelAdmin):
    list_display = ('id', 'color', 'user', 'created_at')
    search_fields = ('color', 'user__email')
