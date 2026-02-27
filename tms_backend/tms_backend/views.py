from rest_framework import generics
from .models import Task
from .serializers import TaskSerializer

# List all tasks / Create new task
class TaskListCreateAPIView(generics.ListCreateAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer

# Retrieve / Update / Delete a single task
class TaskDisplayUpdateDeleteAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
# Create your views here.
