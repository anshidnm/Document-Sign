# Generated by Django 5.0.4 on 2024-05-03 12:06

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('sign', '0002_document_sign'),
    ]

    operations = [
        migrations.AddField(
            model_name='document',
            name='name',
            field=models.CharField(default='default', max_length=100),
            preserve_default=False,
        ),
    ]
