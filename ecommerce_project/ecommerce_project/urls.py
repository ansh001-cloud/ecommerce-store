from django.contrib import admin
from django.urls import path, include # Add include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('store.urls')), # Include your store app's URLs
    path('accounts/', include('django.contrib.auth.urls')), # For login, logout etc.
    # We will add cart and order URLs to store.urls or a new app's urls
]

# Serve media files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)