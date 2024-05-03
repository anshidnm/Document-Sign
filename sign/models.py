from django.db import models
from user.models import User


class Document(models.Model):
    """
    Model for store each document
    """
    from_user = models.ForeignKey(User, on_delete=models.CASCADE)
    to_email = models.EmailField(max_length=250)
    file = models.FileField()
    name = models.CharField(max_length=100)
    page_data = models.JSONField(default=dict)
    is_signed = models.BooleanField(default=False)
    signed_at = models.DateTimeField(null=True, blank=True)
    sign = models.CharField(max_length=50, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
