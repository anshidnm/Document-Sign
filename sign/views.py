from datetime import datetime
from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import JsonResponse
from django.shortcuts import render
from django.template.loader import render_to_string
from django.views.generic import View

from .models import Document

import json


class Homeview(LoginRequiredMixin, View):
    """
    View for home page
    """

    login_url = "/user/login/"

    def get(self, request, *args, **kwargs):
        doc_type = request.GET.get("doc_type", "")
        if doc_type and doc_type=="from":
            docs = (
                Document.objects
                .select_related("from_user")
                .filter(from_user=request.user)
                .order_by("-id")
            )
        else:
            docs = (
                Document.objects
                .select_related("from_user")
                .filter(to_email=request.user.email)
                .order_by("-id")
            )
        context={"docs": docs}
        if doc_type:
            html = render_to_string("table.html", context, request)
            return JsonResponse({"template": html})
        return render(request, "home.html", context)


class SignAreaView(LoginRequiredMixin, View):
    """
    View for managing signature area
    """

    login_url = "/user/login/"

    def get(self, request, *args, **kwargs):
        return render(request, "sign_area.html")
    
    def post(self, request, *args, **kwargs):
        try:
            file = request.FILES["file"]
            sign_data = json.loads(request.POST["page_data"])
            recievers = json.loads(request.POST["recievers"])
            name = request.POST["doc_name"]
            data = [
            Document(
                from_user=request.user,
                to_email=email,
                file=file,
                page_data=sign_data,
                name=name
            )
            for email in recievers
            ]
            Document.objects.bulk_create(data)
            return JsonResponse({"status": True})
        except Exception as e:
            return JsonResponse({"status": False})
    

class SignPutView(LoginRequiredMixin, View): 
    """
    View for put and view signature
    """

    login_url = "/user/login/"

    def get(self, request, *args, **kwargs):
        doc = (
            Document.objects
            .select_related("from_user")
            .get(id=kwargs["id"])
        )
        context = {"doc": doc}
        return render(request, "sign_view.html", context)
    
    def post(self, request, *args, **kwargs):
        try:
            sign = request.POST["sign"]
            pk = kwargs["id"]
            doc = Document.objects.get(pk=pk)
            doc.signed_at = datetime.now()
            doc.is_signed = True
            doc.sign = sign
            doc.save()
            return JsonResponse({"status": True})
        except Exception as e:
            return JsonResponse({"status": False})
    
