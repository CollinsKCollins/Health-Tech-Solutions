import os
import psycopg2
from django.conf import settings
from django.core.management.base import BaseCommand
from django.db import connections
from django.db.utils import OperationalError


class Command(BaseCommand):
    help = "Check if database exists. If not, create it."

    def handle(self, *args, **kwargs):
        db_settings = settings.DATABASES['default']

        db_name = db_settings['NAME']
        db_user = db_settings['USER']
        db_password = db_settings['PASSWORD']
        db_host = db_settings['HOST']
        db_port = db_settings['PORT']

        # Step 1: Try normal Django connection
        try:
            connections['default'].cursor()
            self.stdout.write(self.style.SUCCESS(f"Database '{db_name}' exists and is reachable."))
            return
        except OperationalError:
            self.stdout.write(self.style.WARNING(f"Database '{db_name}' does not exist. Attempting to create it..."))

        # Step 2: Connect to default postgres DB to create it
        try:
            conn = psycopg2.connect(
                dbname='postgres',
                user=db_user,
                password=db_password,
                host=db_host,
                port=db_port,
            )
            conn.autocommit = True
            cursor = conn.cursor()

            cursor.execute(f"CREATE DATABASE {db_name};")

            cursor.close()
            conn.close()

            self.stdout.write(self.style.SUCCESS(f"Database '{db_name}' created successfully."))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Failed to create database: {e}"))