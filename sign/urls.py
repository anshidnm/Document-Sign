from django.urls import path

from .views import SignAreaView, Homeview, SignPutView


app_name = "sign"

urlpatterns = [
    path("", Homeview.as_view(), name="home"),
    path("area/", SignAreaView.as_view(), name="sign_area"),
    path("view/<int:id>/", SignPutView.as_view(), name="sign_put")
]
