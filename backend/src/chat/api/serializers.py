from rest_framework import serializers

from chat.models import ChatMessage, InterviewSession


class MessageSerializer(serializers.ModelSerializer):
    text = serializers.CharField(read_only=True)

    class Meta:
        model = ChatMessage
        fields = ("id", "role", "text", "usage", "created_at")
        read_only_fields = fields


class SessionSerializer(serializers.ModelSerializer):
    messages = serializers.SerializerMethodField()

    class Meta:
        model = InterviewSession
        fields = (
            "id",
            "status",
            "current_phase",
            "collected_data",
            "messages",
            "created_at",
            "updated_at",
        )
        read_only_fields = fields

    def get_messages(self, obj: InterviewSession) -> list:
        visible = obj.messages.filter(is_visible=True)
        return MessageSerializer(visible, many=True).data


class SendMessageSerializer(serializers.Serializer):
    text = serializers.CharField(trim_whitespace=True, max_length=8000)
