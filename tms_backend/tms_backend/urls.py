from django.urls import path
from .views import TaskListCreateAPIView, TaskDisplayUpdateDeleteAPIView

urlpatterns = [
    path('tasks/', TaskListCreateAPIView.as_view(), name='task-list-create'),
    path('tasks/<int:pk>/', TaskDisplayUpdateDeleteAPIView.as_view(), name='task-detail'),
]