from django.contrib.auth import login, authenticate, logout
from django.shortcuts import render, redirect
from django.views.generic import View

from user.models import User


class LoginView(View):
    def get(self, request, *args, **kwargs):
        return render(request, "login.html")
    
    def post(self, request, *args, **kwargs):
        context = {"error": ""}
        email = request.POST.get("email")
        password = request.POST.get("password")
        user = authenticate(request, email=email, password=password)
        if user is not None:
            login(request, user)
            return redirect("/sign/")
        context["error"] = "Invalid credentials"
        return render(request, "login.html", context=context)


class LogoutView(View):
    def post(self, request, *args, **kwargs):
        logout(request)
        return redirect("user:login")


class SignUpView(View):
    def get(self, request, *args, **kwargs):
        return render(request, "signup.html")
    
    def post(self, request, *args, **kwargs):
        context = {"error": ""}
        email = request.POST.get("email")
        name = request.POST.get("name")
        password = request.POST.get("password")
        if User.objects.filter(email=email).exists():
            context["error"] = "Email already exist"
            return render(request, "signup.html", context=context)
        user = User(email=email, first_name=name)
        user.set_password(password)
        user.save()
        return redirect("user:login")

